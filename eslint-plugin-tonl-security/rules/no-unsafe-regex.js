/**
 * Rule: no-unsafe-regex
 *
 * Detects potentially dangerous regex patterns that may be vulnerable to ReDoS.
 * Flags nested quantifiers, excessive backtracking patterns, and other risky constructs.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect potentially ReDoS-vulnerable regex patterns',
      category: 'Security',
      recommended: true,
      url: 'https://github.com/tonl-dev/tonl/blob/main/docs/SECURITY.md'
    },
    messages: {
      nestedQuantifiers: 'Nested quantifiers detected ({{pattern}}) - potential ReDoS vulnerability. Consider using safeRegexTest() wrapper.',
      excessiveBacktracking: 'Pattern may cause excessive backtracking ({{pattern}}). Consider simplifying or using safeRegexTest() wrapper.',
      overlappingAlternatives: 'Overlapping alternatives detected - may cause exponential backtracking.',
      unboundedRepetition: 'Unbounded repetition with complex pattern - consider adding limits.',
      dynamicRegex: 'Dynamic RegExp construction with user input - ensure input is sanitized.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxQuantifierNesting: {
            type: 'number',
            default: 1,
            description: 'Maximum allowed quantifier nesting level'
          },
          checkDynamicRegex: {
            type: 'boolean',
            default: true,
            description: 'Check new RegExp() calls'
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const maxNesting = options.maxQuantifierNesting || 1;
    const checkDynamic = options.checkDynamicRegex !== false;

    /**
     * Check if pattern has nested quantifiers
     */
    function hasNestedQuantifiers(pattern) {
      // Patterns like (a+)+ or (a*)*
      const nestedPatterns = [
        /\([^)]*[+*?]\)[+*?]/,      // (x+)+, (x*)+, etc.
        /\([^)]*\{[^}]+\}\)[+*?]/,  // (x{n})+
        /\[[^\]]*[+*?]\][+*?]/      // [x+]+
      ];

      return nestedPatterns.some(p => p.test(pattern));
    }

    /**
     * Check for excessive backtracking patterns
     */
    function hasExcessiveBacktracking(pattern) {
      const riskyPatterns = [
        /\(\.\*\)[+*]/,              // (.*)+
        /\([^)]+\|[^)]+\)[+*]/,      // (a|b)+  with overlapping
        /\[\^[^\]]*\]\*.*\[\^[^\]]*\]\*/,  // [^x]*...[^y]*
        /\.+.+\.+/                    // .+.+.+ chains
      ];

      return riskyPatterns.some(p => p.test(pattern));
    }

    /**
     * Check for overlapping alternatives
     */
    function hasOverlappingAlternatives(pattern) {
      // Simple check for common overlapping patterns
      const overlapping = [
        /\(a\*\|a\+\)/i,             // (a*|a+)
        /\(\.\*\|\.\+\)/,            // (.*|.+)
        /\([^|]+\*\|[^|]+\+\)/       // similar patterns
      ];

      return overlapping.some(p => p.test(pattern));
    }

    /**
     * Analyze regex pattern for vulnerabilities
     */
    function analyzePattern(pattern, node) {
      if (hasNestedQuantifiers(pattern)) {
        context.report({
          node,
          messageId: 'nestedQuantifiers',
          data: { pattern: truncatePattern(pattern) }
        });
        return;
      }

      if (hasExcessiveBacktracking(pattern)) {
        context.report({
          node,
          messageId: 'excessiveBacktracking',
          data: { pattern: truncatePattern(pattern) }
        });
        return;
      }

      if (hasOverlappingAlternatives(pattern)) {
        context.report({
          node,
          messageId: 'overlappingAlternatives'
        });
      }
    }

    /**
     * Truncate long patterns for error messages
     */
    function truncatePattern(pattern) {
      if (pattern.length > 50) {
        return pattern.slice(0, 47) + '...';
      }
      return pattern;
    }

    return {
      // Check regex literals: /pattern/
      Literal(node) {
        if (!node.regex) return;

        const pattern = node.regex.pattern;
        analyzePattern(pattern, node);
      },

      // Check RegExp constructor: new RegExp(pattern)
      NewExpression(node) {
        if (!checkDynamic) return;

        const callee = node.callee;
        if (callee.type !== 'Identifier' || callee.name !== 'RegExp') {
          return;
        }

        const args = node.arguments;
        if (args.length === 0) return;

        const firstArg = args[0];

        // If pattern is a string literal, analyze it
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          analyzePattern(firstArg.value, node);
          return;
        }

        // If pattern is a template literal without expressions, analyze it
        if (firstArg.type === 'TemplateLiteral' && firstArg.expressions.length === 0) {
          const pattern = firstArg.quasis.map(q => q.value.raw).join('');
          analyzePattern(pattern, node);
          return;
        }

        // Dynamic pattern - warn about potential risk
        if (firstArg.type === 'Identifier' ||
            firstArg.type === 'MemberExpression' ||
            firstArg.type === 'CallExpression' ||
            (firstArg.type === 'TemplateLiteral' && firstArg.expressions.length > 0)) {
          context.report({
            node,
            messageId: 'dynamicRegex'
          });
        }
      },

      // Check RegExp() call (without new)
      CallExpression(node) {
        if (!checkDynamic) return;

        const callee = node.callee;
        if (callee.type !== 'Identifier' || callee.name !== 'RegExp') {
          return;
        }

        const args = node.arguments;
        if (args.length === 0) return;

        const firstArg = args[0];

        // If pattern is a string literal, analyze it
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          analyzePattern(firstArg.value, node);
        }
      }
    };
  }
};
