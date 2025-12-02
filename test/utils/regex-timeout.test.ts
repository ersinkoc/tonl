/**
 * Regex Timeout Wrapper Tests (Task 007)
 *
 * Tests for safe regex execution with timeout protection.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  safeRegexTest,
  safeRegexMatch,
  safeRegexReplace,
  createSafeRegexExecutor,
  DEFAULT_REGEX_TIMEOUT_OPTIONS,
} from '../../dist/utils/regex-timeout.js';

describe('Regex Timeout Wrapper', () => {

  describe('safeRegexTest', () => {

    it('should execute simple patterns correctly', () => {
      assert.strictEqual(safeRegexTest(/hello/, 'hello world'), true);
      assert.strictEqual(safeRegexTest(/goodbye/, 'hello world'), false);
    });

    it('should handle RegExp objects', () => {
      const regex = new RegExp('test', 'i');
      assert.strictEqual(safeRegexTest(regex, 'TEST'), true);
    });

    it('should handle string patterns', () => {
      assert.strictEqual(safeRegexTest('hello', 'hello world'), true);
      assert.strictEqual(safeRegexTest('^hello', 'hello world'), true);
      assert.strictEqual(safeRegexTest('^world', 'hello world'), false);
    });

    it('should handle long inputs', () => {
      const longInput = 'a'.repeat(10000);
      assert.strictEqual(safeRegexTest(/^a+$/, longInput), true);
      assert.strictEqual(safeRegexTest(/b/, longInput), false);
    });

    it('should handle empty strings', () => {
      assert.strictEqual(safeRegexTest(/.*/, ''), true);
      assert.strictEqual(safeRegexTest(/.+/, ''), false);
    });

    it('should return false on invalid pattern with throwOnTimeout=false', () => {
      // Invalid regex pattern (unclosed bracket)
      const result = safeRegexTest('[invalid', 'test', { throwOnTimeout: false });
      assert.strictEqual(result, false);
    });

    it('should throw on invalid pattern with throwOnTimeout=true', () => {
      assert.throws(() => {
        safeRegexTest('[invalid', 'test', { throwOnTimeout: true });
      }, /Regex test failed/);
    });

    it('should use custom timeout option', () => {
      // This should not throw even with very short timeout for simple patterns
      const result = safeRegexTest(/hello/, 'hello', { timeout: 1 });
      assert.strictEqual(result, true);
    });

    it('should respect minInputLengthForTimeout option', () => {
      // With high threshold, even long inputs skip timeout overhead
      const longInput = 'hello '.repeat(500);
      const result = safeRegexTest(/hello/, longInput, {
        minInputLengthForTimeout: 10000,
      });
      assert.strictEqual(result, true);
    });
  });

  describe('safeRegexMatch', () => {

    it('should return match array for matching patterns', () => {
      const result = safeRegexMatch(/(\w+)/, 'hello world');
      assert.ok(result);
      assert.strictEqual(result[0], 'hello');
      assert.strictEqual(result[1], 'hello');
    });

    it('should return null for non-matching patterns', () => {
      const result = safeRegexMatch(/\d+/, 'hello world');
      assert.strictEqual(result, null);
    });

    it('should handle global flag', () => {
      // Note: match with global flag returns all matches without groups
      const result = safeRegexMatch(/\w+/g, 'hello world');
      assert.ok(result);
      assert.deepStrictEqual(result, ['hello', 'world']);
    });

    it('should handle long inputs', () => {
      const longInput = 'hello ' + 'a'.repeat(5000);
      const result = safeRegexMatch(/hello/, longInput);
      assert.ok(result);
      assert.strictEqual(result[0], 'hello');
    });

    it('should return null on error with throwOnTimeout=false', () => {
      const result = safeRegexMatch('[invalid', 'test', { throwOnTimeout: false });
      assert.strictEqual(result, null);
    });

    it('should throw on error with throwOnTimeout=true', () => {
      assert.throws(() => {
        safeRegexMatch('[invalid', 'test', { throwOnTimeout: true });
      }, /Regex match failed/);
    });
  });

  describe('safeRegexReplace', () => {

    it('should replace matches correctly', () => {
      const result = safeRegexReplace(/world/, 'hello world', 'universe');
      assert.strictEqual(result, 'hello universe');
    });

    it('should handle global replacement', () => {
      const result = safeRegexReplace(/o/g, 'hello world', '0');
      assert.strictEqual(result, 'hell0 w0rld');
    });

    it('should handle replacement function', () => {
      const result = safeRegexReplace(/\w+/g, 'hello world', (match) => match.toUpperCase());
      assert.strictEqual(result, 'HELLO WORLD');
    });

    it('should handle long inputs', () => {
      const longInput = 'hello ' + 'a'.repeat(5000);
      const result = safeRegexReplace(/hello/, longInput, 'hi');
      assert.strictEqual(result.startsWith('hi '), true);
    });

    it('should return original on error with throwOnTimeout=false', () => {
      const result = safeRegexReplace('[invalid', 'test', 'replacement', { throwOnTimeout: false });
      assert.strictEqual(result, 'test'); // Returns original
    });

    it('should throw on error with throwOnTimeout=true', () => {
      assert.throws(() => {
        safeRegexReplace('[invalid', 'test', 'replacement', { throwOnTimeout: true });
      }, /Regex replace failed/);
    });
  });

  describe('createSafeRegexExecutor', () => {

    it('should create executor with default options', () => {
      const executor = createSafeRegexExecutor();

      assert.strictEqual(executor.test(/hello/, 'hello'), true);
      const match = executor.match(/hello/, 'hello');
      assert.ok(match);
      assert.strictEqual(match[0], 'hello');
      assert.strictEqual(executor.replace(/hello/, 'hello world', 'hi'), 'hi world');
    });

    it('should use pre-configured options', () => {
      const executor = createSafeRegexExecutor({ throwOnTimeout: false });

      // Should not throw even with invalid pattern
      assert.strictEqual(executor.test('[invalid', 'test'), false);
      assert.strictEqual(executor.match('[invalid', 'test'), null);
      assert.strictEqual(executor.replace('[invalid', 'test', 'x'), 'test');
    });

    it('should allow option overrides', () => {
      const executor = createSafeRegexExecutor({ throwOnTimeout: false });

      // Override to throw
      assert.throws(() => {
        executor.test('[invalid', 'test', { throwOnTimeout: true });
      }, /Regex test failed/);
    });

    it('should use custom timeout', () => {
      const executor = createSafeRegexExecutor({ timeout: 50 });

      // Should work normally
      assert.strictEqual(executor.test(/hello/, 'hello world'), true);
    });
  });

  describe('DEFAULT_REGEX_TIMEOUT_OPTIONS', () => {

    it('should have expected default values', () => {
      assert.strictEqual(DEFAULT_REGEX_TIMEOUT_OPTIONS.timeout, 100);
      assert.strictEqual(DEFAULT_REGEX_TIMEOUT_OPTIONS.throwOnTimeout, true);
      assert.strictEqual(DEFAULT_REGEX_TIMEOUT_OPTIONS.minInputLengthForTimeout, 1000);
    });
  });

  describe('Edge Cases', () => {

    it('should handle special regex characters in pattern', () => {
      assert.strictEqual(safeRegexTest(/\d+/, '123'), true);
      assert.strictEqual(safeRegexTest(/\s+/, '   '), true);
      assert.strictEqual(safeRegexTest(/\w+/, 'hello'), true);
    });

    it('should handle unicode strings', () => {
      assert.strictEqual(safeRegexTest(/日本語/, '日本語テスト'), true);
      assert.strictEqual(safeRegexTest(/[ぁ-ん]+/, 'ひらがな'), true);
    });

    it('should handle multiline strings', () => {
      const multiline = 'line1\nline2\nline3';
      assert.strictEqual(safeRegexTest(/line2/, multiline), true);
      assert.strictEqual(safeRegexTest(/^line2$/m, multiline), true);
    });

    it('should handle case insensitive flag', () => {
      assert.strictEqual(safeRegexTest(/HELLO/i, 'hello'), true);
      assert.strictEqual(safeRegexTest(/hello/i, 'HELLO'), true);
    });

    it('should handle capturing groups', () => {
      const result = safeRegexMatch(/(\d+)-(\d+)/, 'value: 123-456');
      assert.ok(result);
      assert.strictEqual(result[1], '123');
      assert.strictEqual(result[2], '456');
    });

    it('should handle non-capturing groups', () => {
      const result = safeRegexMatch(/(?:hello|hi) world/, 'hello world');
      assert.ok(result);
      assert.strictEqual(result[0], 'hello world');
    });

    it('should handle lookahead patterns', () => {
      // Simple lookahead should work
      assert.strictEqual(safeRegexTest(/hello(?= world)/, 'hello world'), true);
      assert.strictEqual(safeRegexTest(/hello(?= world)/, 'hello there'), false);
    });

    it('should handle backreferences', () => {
      const result = safeRegexMatch(/(\w+)\s+\1/, 'hello hello');
      assert.ok(result);
      assert.strictEqual(result[0], 'hello hello');
    });
  });
});
