# eslint-plugin-tonl-security

Custom ESLint rules for TONL security patterns. Catches security issues at development time.

## Installation

This plugin is included in the TONL repository. To use it in your ESLint configuration:

```javascript
// eslint.config.js
import tonlSecurity from './eslint-plugin-tonl-security/index.js';

export default [
  {
    plugins: {
      'tonl-security': tonlSecurity
    },
    rules: {
      'tonl-security/no-direct-property-access': 'warn',
      'tonl-security/no-unsafe-regex': 'warn',
      'tonl-security/require-depth-limit': 'warn'
    }
  }
];
```

## Rules

### no-direct-property-access

Detects dynamic property access that may be vulnerable to prototype pollution.

**Bad:**
```javascript
// Vulnerable to prototype pollution
const value = obj[userInput];
obj[key] = value;
if (key in obj) { ... }
```

**Good:**
```javascript
import { isDangerousProperty } from './utils/property-security.js';

// Safe with validation
if (!isDangerousProperty(key)) {
  const value = obj[key];
}

// Safe static access
const value = obj.staticProperty;

// Safe with Object.prototype.hasOwnProperty.call
if (Object.prototype.hasOwnProperty.call(obj, key)) { ... }
```

### no-unsafe-regex

Detects potentially dangerous regex patterns that may be vulnerable to ReDoS.

**Bad:**
```javascript
// Nested quantifiers - ReDoS vulnerable
const regex = /(a+)+$/;
const pattern = /([a-z]+)*$/;

// Dynamic regex from user input
new RegExp(userInput);
```

**Good:**
```javascript
// Simple patterns
const regex = /^[a-z]+$/;

// Use safeRegexTest wrapper for untrusted patterns
import { safeRegexTest } from './utils/regex-timeout.js';
safeRegexTest(pattern, input, 1000);
```

### require-depth-limit

Ensures recursive functions have depth limiting to prevent stack overflow attacks.

**Bad:**
```javascript
// No depth limit - vulnerable to DoS
function traverse(node) {
  if (node.children) {
    node.children.forEach(child => traverse(child));
  }
}
```

**Good:**
```javascript
// With depth limit
function traverse(node, depth = 0) {
  if (depth > MAX_DEPTH) {
    throw new Error('Maximum depth exceeded');
  }
  if (node.children) {
    node.children.forEach(child => traverse(child, depth + 1));
  }
}
```

## Configurations

### Recommended

```javascript
{
  extends: ['plugin:tonl-security/recommended']
}
```

All rules set to `warn`.

### Strict

```javascript
{
  extends: ['plugin:tonl-security/strict']
}
```

All rules set to `error`.

## Options

### no-direct-property-access

- `allowedFiles`: Array of file patterns exempt from this rule
- `checkInOperator`: Whether to check `in` operator usage (default: true)

### no-unsafe-regex

- `maxQuantifierNesting`: Maximum allowed quantifier nesting (default: 1)
- `checkDynamicRegex`: Check `new RegExp()` calls (default: true)

### require-depth-limit

- `depthParamNames`: Parameter names indicating depth tracking
- `exemptFunctions`: Function names exempt from this rule

## Integration with TONL

This plugin is designed to work with TONL's security utilities:

- `isDangerousProperty()` from `src/utils/property-security.ts`
- `safeRegexTest()` from `src/utils/regex-timeout.ts`
- `DANGEROUS_PROPERTIES` set for prototype pollution prevention
- `MAX_*_DEPTH` constants from `src/utils/security-limits.ts`
