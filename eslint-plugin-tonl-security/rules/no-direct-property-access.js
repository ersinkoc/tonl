/**
 * Rule: no-direct-property-access
 *
 * Detects dynamic property access that may be vulnerable to prototype pollution.
 * Recommends using isDangerousProperty check before dynamic property access.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require isDangerousProperty check before dynamic property access',
      category: 'Security',
      recommended: true,
      url: 'https://github.com/tonl-dev/tonl/blob/main/docs/SECURITY.md'
    },
    messages: {
      missingCheck: 'Dynamic property access "{{property}}" without isDangerousProperty validation. Consider using isDangerousProperty() check.',
      unsafeInOperator: 'Using "in" operator with dynamic key without isDangerousProperty validation.',
      unsafeHasOwnProperty: 'Prefer Object.prototype.hasOwnProperty.call() or Object.hasOwn() for safer property checks.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Files that are allowed to use dynamic property access'
          },
          checkInOperator: {
            type: 'boolean',
            default: true,
            description: 'Check "in" operator usage'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedFiles = options.allowedFiles || [
      'property-security.ts',
      'property-security.js'
    ];
    const checkInOperator = options.checkInOperator !== false;

    // Check if current file is in allowed list
    const filename = context.getFilename();
    const isAllowedFile = allowedFiles.some(allowed =>
      filename.endsWith(allowed) || filename.includes(allowed)
    );

    if (isAllowedFile) {
      return {}; // Skip checking for allowed files
    }

    // Track if isDangerousProperty was called in current scope
    const scopeChecks = new Map();

    /**
     * Check if a node represents a safe pattern
     */
    function isSafePattern(node) {
      // Check if it's inside an if statement with isDangerousProperty check
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'IfStatement') {
          const test = parent.test;
          if (containsSecurityCheck(test)) {
            return true;
          }
        }
        if (parent.type === 'ConditionalExpression') {
          if (containsSecurityCheck(parent.test)) {
            return true;
          }
        }
        parent = parent.parent;
      }
      return false;
    }

    /**
     * Check if expression contains isDangerousProperty or similar security check
     */
    function containsSecurityCheck(node) {
      if (!node) return false;

      // Check for isDangerousProperty call
      if (node.type === 'CallExpression') {
        const callee = node.callee;
        if (callee.type === 'Identifier' && callee.name === 'isDangerousProperty') {
          return true;
        }
        if (callee.type === 'MemberExpression') {
          const prop = callee.property;
          if (prop.type === 'Identifier' && prop.name === 'isDangerousProperty') {
            return true;
          }
        }
      }

      // Check for negation: !isDangerousProperty(...)
      if (node.type === 'UnaryExpression' && node.operator === '!') {
        return containsSecurityCheck(node.argument);
      }

      // Check logical expressions: && and ||
      if (node.type === 'LogicalExpression') {
        return containsSecurityCheck(node.left) || containsSecurityCheck(node.right);
      }

      // Check for DANGEROUS_PROPERTIES.has() check
      if (node.type === 'CallExpression') {
        const callee = node.callee;
        if (callee.type === 'MemberExpression') {
          const obj = callee.object;
          const prop = callee.property;
          if (obj.type === 'Identifier' &&
              obj.name === 'DANGEROUS_PROPERTIES' &&
              prop.type === 'Identifier' &&
              prop.name === 'has') {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Check if property is a literal (safe)
     */
    function isLiteralProperty(node) {
      return node.type === 'Literal' && typeof node.value === 'string';
    }

    return {
      // Check computed member expressions: obj[key]
      MemberExpression(node) {
        if (!node.computed) {
          return; // Static access like obj.prop is safe
        }

        const property = node.property;

        // Skip literal properties (obj["staticKey"])
        if (isLiteralProperty(property)) {
          return;
        }

        // Skip numeric indices (arr[0])
        if (property.type === 'Literal' && typeof property.value === 'number') {
          return;
        }

        // Check if inside a safe pattern
        if (isSafePattern(node)) {
          return;
        }

        // Report dynamic property access
        const propertyName = property.type === 'Identifier'
          ? property.name
          : '[computed]';

        context.report({
          node,
          messageId: 'missingCheck',
          data: { property: propertyName }
        });
      },

      // Check "in" operator usage
      BinaryExpression(node) {
        if (!checkInOperator) return;
        if (node.operator !== 'in') return;

        const left = node.left;

        // Skip literal keys
        if (isLiteralProperty(left)) {
          return;
        }

        // Check if inside a safe pattern
        if (isSafePattern(node)) {
          return;
        }

        context.report({
          node,
          messageId: 'unsafeInOperator'
        });
      },

      // Check hasOwnProperty calls on object instances
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression') return;

        const prop = callee.property;
        if (prop.type !== 'Identifier') return;

        if (prop.name === 'hasOwnProperty') {
          // Check if it's Object.prototype.hasOwnProperty.call (safe)
          const obj = callee.object;
          if (obj.type === 'MemberExpression') {
            const innerObj = obj.object;
            const innerProp = obj.property;
            if (innerObj.type === 'MemberExpression' &&
                innerObj.object.type === 'Identifier' &&
                innerObj.object.name === 'Object' &&
                innerObj.property.type === 'Identifier' &&
                innerObj.property.name === 'prototype' &&
                innerProp.type === 'Identifier' &&
                innerProp.name === 'hasOwnProperty') {
              return; // Safe pattern
            }
          }

          // Direct hasOwnProperty call on object - warn
          context.report({
            node,
            messageId: 'unsafeHasOwnProperty'
          });
        }
      }
    };
  }
};
