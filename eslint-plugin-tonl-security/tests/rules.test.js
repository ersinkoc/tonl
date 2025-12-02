/**
 * Tests for ESLint security rules
 *
 * Run with: node --test eslint-plugin-tonl-security/tests/rules.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Import rules
import noDirectPropertyAccess from '../rules/no-direct-property-access.js';
import noUnsafeRegex from '../rules/no-unsafe-regex.js';
import requireDepthLimit from '../rules/require-depth-limit.js';

describe('ESLint Security Rules', () => {

  describe('no-direct-property-access', () => {

    it('should have correct meta information', () => {
      assert.strictEqual(noDirectPropertyAccess.meta.type, 'problem');
      assert.ok(noDirectPropertyAccess.meta.docs.description.length > 0);
      assert.ok(noDirectPropertyAccess.meta.messages.missingCheck);
      assert.ok(noDirectPropertyAccess.meta.messages.unsafeInOperator);
      assert.ok(noDirectPropertyAccess.meta.messages.unsafeHasOwnProperty);
    });

    it('should have create function', () => {
      assert.strictEqual(typeof noDirectPropertyAccess.create, 'function');
    });

    it('should return visitor object', () => {
      const mockContext = {
        options: [],
        getFilename: () => 'test.js'
      };
      const visitor = noDirectPropertyAccess.create(mockContext);
      assert.strictEqual(typeof visitor, 'object');
      assert.strictEqual(typeof visitor.MemberExpression, 'function');
      assert.strictEqual(typeof visitor.BinaryExpression, 'function');
    });
  });

  describe('no-unsafe-regex', () => {

    it('should have correct meta information', () => {
      assert.strictEqual(noUnsafeRegex.meta.type, 'problem');
      assert.ok(noUnsafeRegex.meta.docs.description.length > 0);
      assert.ok(noUnsafeRegex.meta.messages.nestedQuantifiers);
      assert.ok(noUnsafeRegex.meta.messages.excessiveBacktracking);
    });

    it('should have create function', () => {
      assert.strictEqual(typeof noUnsafeRegex.create, 'function');
    });

    it('should return visitor object', () => {
      const mockContext = {
        options: []
      };
      const visitor = noUnsafeRegex.create(mockContext);
      assert.strictEqual(typeof visitor, 'object');
      assert.strictEqual(typeof visitor.Literal, 'function');
      assert.strictEqual(typeof visitor.NewExpression, 'function');
    });
  });

  describe('require-depth-limit', () => {

    it('should have correct meta information', () => {
      assert.strictEqual(requireDepthLimit.meta.type, 'suggestion');
      assert.ok(requireDepthLimit.meta.docs.description.length > 0);
      assert.ok(requireDepthLimit.meta.messages.missingDepthParam);
      assert.ok(requireDepthLimit.meta.messages.missingDepthCheck);
    });

    it('should have create function', () => {
      assert.strictEqual(typeof requireDepthLimit.create, 'function');
    });

    it('should return visitor object', () => {
      const mockContext = {
        options: [],
        getSourceCode: () => ({ getText: () => '' })
      };
      const visitor = requireDepthLimit.create(mockContext);
      assert.strictEqual(typeof visitor, 'object');
      assert.strictEqual(typeof visitor.FunctionDeclaration, 'function');
      assert.strictEqual(typeof visitor.CallExpression, 'function');
    });
  });

  describe('Plugin Index', async () => {

    it('should export all rules', async () => {
      const plugin = await import('../index.js');
      const pluginDefault = plugin.default;

      assert.ok(pluginDefault.rules['no-direct-property-access']);
      assert.ok(pluginDefault.rules['no-unsafe-regex']);
      assert.ok(pluginDefault.rules['require-depth-limit']);
    });

    it('should have recommended config', async () => {
      const plugin = await import('../index.js');
      const pluginDefault = plugin.default;

      assert.ok(pluginDefault.configs.recommended);
      assert.ok(pluginDefault.configs.recommended.rules['tonl-security/no-direct-property-access']);
    });

    it('should have strict config', async () => {
      const plugin = await import('../index.js');
      const pluginDefault = plugin.default;

      assert.ok(pluginDefault.configs.strict);
      assert.strictEqual(
        pluginDefault.configs.strict.rules['tonl-security/no-direct-property-access'],
        'error'
      );
    });
  });
});
