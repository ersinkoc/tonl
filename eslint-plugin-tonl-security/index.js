/**
 * ESLint Plugin: tonl-security
 *
 * Custom ESLint rules for TONL security patterns.
 * Catches security issues at development time.
 */

import noDirectPropertyAccess from './rules/no-direct-property-access.js';
import noUnsafeRegex from './rules/no-unsafe-regex.js';
import requireDepthLimit from './rules/require-depth-limit.js';

export default {
  meta: {
    name: 'eslint-plugin-tonl-security',
    version: '1.0.0'
  },
  rules: {
    'no-direct-property-access': noDirectPropertyAccess,
    'no-unsafe-regex': noUnsafeRegex,
    'require-depth-limit': requireDepthLimit
  },
  configs: {
    recommended: {
      plugins: ['tonl-security'],
      rules: {
        'tonl-security/no-direct-property-access': 'warn',
        'tonl-security/no-unsafe-regex': 'warn',
        'tonl-security/require-depth-limit': 'warn'
      }
    },
    strict: {
      plugins: ['tonl-security'],
      rules: {
        'tonl-security/no-direct-property-access': 'error',
        'tonl-security/no-unsafe-regex': 'error',
        'tonl-security/require-depth-limit': 'error'
      }
    }
  }
};
