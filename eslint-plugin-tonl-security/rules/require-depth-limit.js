/**
 * Rule: require-depth-limit
 *
 * Ensures recursive functions have depth limiting to prevent stack overflow attacks.
 * Flags recursive functions that don't check a depth parameter.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require depth checking in recursive functions',
      category: 'Security',
      recommended: true,
      url: 'https://github.com/tonl-dev/tonl/blob/main/docs/SECURITY.md'
    },
    messages: {
      missingDepthParam: 'Recursive function "{{name}}" should have a depth parameter for DoS protection.',
      missingDepthCheck: 'Recursive function "{{name}}" should check depth limit before recursing.',
      unboundedRecursion: 'Recursive call without depth decrement detected. Consider adding depth tracking.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          depthParamNames: {
            type: 'array',
            items: { type: 'string' },
            default: ['depth', 'level', 'maxDepth', 'currentDepth'],
            description: 'Parameter names that indicate depth tracking'
          },
          exemptFunctions: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Function names exempt from this rule'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const depthParamNames = options.depthParamNames || [
      'depth', 'level', 'maxDepth', 'currentDepth', 'recursionDepth'
    ];
    const exemptFunctions = options.exemptFunctions || [];

    // Track function declarations and their recursive calls
    const functionStack = [];

    /**
     * Get function name from node
     */
    function getFunctionName(node) {
      if (node.id && node.id.name) {
        return node.id.name;
      }
      if (node.parent && node.parent.type === 'VariableDeclarator') {
        return node.parent.id.name;
      }
      if (node.parent && node.parent.type === 'Property') {
        return node.parent.key.name || node.parent.key.value;
      }
      if (node.parent && node.parent.type === 'MethodDefinition') {
        return node.parent.key.name;
      }
      return null;
    }

    /**
     * Check if function has depth parameter
     */
    function hasDepthParameter(node) {
      const params = node.params || [];
      return params.some(param => {
        if (param.type === 'Identifier') {
          return depthParamNames.some(name =>
            param.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
          return depthParamNames.some(name =>
            param.left.name.toLowerCase().includes(name.toLowerCase())
          );
        }
        return false;
      });
    }

    /**
     * Check if function body contains depth check
     */
    function hasDepthCheck(node) {
      const body = node.body;
      if (!body) return false;

      // Simple check: look for if statements that might be depth checks
      const sourceCode = context.getSourceCode();
      const text = sourceCode.getText(body);

      // Common depth check patterns
      const depthCheckPatterns = [
        /if\s*\(\s*depth\s*[<>=]/i,
        /if\s*\(\s*level\s*[<>=]/i,
        /if\s*\(\s*maxDepth\s*[<>=]/i,
        /depth\s*>\s*\d+/i,
        /level\s*>\s*\d+/i,
        /throw.*depth/i,
        /throw.*recursion/i,
        /MAX_.*DEPTH/i
      ];

      return depthCheckPatterns.some(pattern => pattern.test(text));
    }

    /**
     * Check if call is recursive (calls current function)
     */
    function isRecursiveCall(callNode, functionName) {
      const callee = callNode.callee;
      if (callee.type === 'Identifier' && callee.name === functionName) {
        return true;
      }
      if (callee.type === 'MemberExpression') {
        if (callee.property.type === 'Identifier' &&
            callee.property.name === functionName) {
          return true;
        }
        // this.methodName() recursive call
        if (callee.object.type === 'ThisExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === functionName) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check function for recursive calls
     */
    function checkFunctionForRecursion(node) {
      const functionName = getFunctionName(node);
      if (!functionName) return;

      // Skip exempt functions
      if (exemptFunctions.includes(functionName)) return;

      // Track this function
      functionStack.push({
        node,
        name: functionName,
        hasDepthParam: hasDepthParameter(node),
        hasDepthCheck: hasDepthCheck(node),
        recursiveCalls: []
      });
    }

    /**
     * Check call expression for recursion
     */
    function checkCallForRecursion(callNode) {
      if (functionStack.length === 0) return;

      const currentFunction = functionStack[functionStack.length - 1];
      if (isRecursiveCall(callNode, currentFunction.name)) {
        currentFunction.recursiveCalls.push(callNode);
      }
    }

    /**
     * Report issues for function
     */
    function reportFunctionIssues() {
      if (functionStack.length === 0) return;

      const functionInfo = functionStack.pop();
      if (functionInfo.recursiveCalls.length === 0) return;

      // Has recursive calls but no depth parameter
      if (!functionInfo.hasDepthParam) {
        context.report({
          node: functionInfo.node,
          messageId: 'missingDepthParam',
          data: { name: functionInfo.name }
        });
        return;
      }

      // Has depth parameter but no depth check
      if (!functionInfo.hasDepthCheck) {
        context.report({
          node: functionInfo.node,
          messageId: 'missingDepthCheck',
          data: { name: functionInfo.name }
        });
      }
    }

    return {
      // Track function declarations
      FunctionDeclaration(node) {
        checkFunctionForRecursion(node);
      },

      'FunctionDeclaration:exit'() {
        reportFunctionIssues();
      },

      // Track function expressions
      FunctionExpression(node) {
        checkFunctionForRecursion(node);
      },

      'FunctionExpression:exit'() {
        reportFunctionIssues();
      },

      // Track arrow functions
      ArrowFunctionExpression(node) {
        checkFunctionForRecursion(node);
      },

      'ArrowFunctionExpression:exit'() {
        reportFunctionIssues();
      },

      // Check call expressions for recursion
      CallExpression(node) {
        checkCallForRecursion(node);
      }
    };
  }
};
