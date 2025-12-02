/**
 * CLI Validation Tests (Task 018)
 *
 * Tests for unified CLI input validation utilities.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateDelimiter,
  validateTokenizer,
  validateNumber,
  validateIndent,
  validateVersion,
  validateQueryExpression,
  validateAll
} from '../../dist/cli/validation.js';

describe('CLI Validation', () => {

  describe('validateDelimiter', () => {

    it('should return default comma when undefined', () => {
      const result = validateDelimiter(undefined);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, ',');
    });

    it('should accept comma delimiter', () => {
      const result = validateDelimiter(',');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, ',');
    });

    it('should accept pipe delimiter', () => {
      const result = validateDelimiter('|');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, '|');
    });

    it('should accept tab delimiter', () => {
      const result = validateDelimiter('\t');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, '\t');
    });

    it('should accept semicolon delimiter', () => {
      const result = validateDelimiter(';');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, ';');
    });

    it('should accept alias "comma"', () => {
      const result = validateDelimiter('comma');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, ',');
    });

    it('should accept alias "pipe"', () => {
      const result = validateDelimiter('pipe');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, '|');
    });

    it('should accept alias "tab"', () => {
      const result = validateDelimiter('tab');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, '\t');
    });

    it('should accept alias "semicolon"', () => {
      const result = validateDelimiter('semicolon');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, ';');
    });

    it('should be case-insensitive for aliases', () => {
      assert.strictEqual(validateDelimiter('COMMA').value, ',');
      assert.strictEqual(validateDelimiter('Pipe').value, '|');
      assert.strictEqual(validateDelimiter('TAB').value, '\t');
    });

    it('should reject invalid delimiter', () => {
      const result = validateDelimiter('invalid');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Invalid delimiter'));
    });

    it('should reject space as delimiter', () => {
      const result = validateDelimiter(' ');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validateTokenizer', () => {

    it('should return default cl100k when undefined', () => {
      const result = validateTokenizer(undefined);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'cl100k');
    });

    it('should accept gpt-5', () => {
      const result = validateTokenizer('gpt-5');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'gpt-5');
    });

    it('should accept claude-3.5', () => {
      const result = validateTokenizer('claude-3.5');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'claude-3.5');
    });

    it('should accept gemini-2.0', () => {
      const result = validateTokenizer('gemini-2.0');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'gemini-2.0');
    });

    it('should accept llama-4', () => {
      const result = validateTokenizer('llama-4');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'llama-4');
    });

    it('should accept o200k', () => {
      const result = validateTokenizer('o200k');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'o200k');
    });

    it('should be case-insensitive', () => {
      assert.strictEqual(validateTokenizer('GPT-5').value, 'gpt-5');
      assert.strictEqual(validateTokenizer('CLAUDE-3.5').value, 'claude-3.5');
    });

    it('should reject invalid tokenizer', () => {
      const result = validateTokenizer('gpt-2');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Invalid tokenizer'));
    });
  });

  describe('validateNumber', () => {

    it('should return default when undefined', () => {
      const result = validateNumber(undefined, { name: 'Test', default: 10 });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 10);
    });

    it('should accept valid number string', () => {
      const result = validateNumber('42', { name: 'Test' });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 42);
    });

    it('should accept number type', () => {
      const result = validateNumber(42, { name: 'Test' });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 42);
    });

    it('should accept float', () => {
      const result = validateNumber('3.14', { name: 'Test' });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 3.14);
    });

    it('should reject non-numeric string', () => {
      const result = validateNumber('abc', { name: 'Test' });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('must be a number'));
    });

    it('should reject below minimum', () => {
      const result = validateNumber('5', { name: 'Value', min: 10 });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('at least 10'));
    });

    it('should reject above maximum', () => {
      const result = validateNumber('100', { name: 'Value', max: 50 });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('at most 50'));
    });

    it('should reject non-integer when integer required', () => {
      const result = validateNumber('3.5', { name: 'Count', integer: true });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('must be an integer'));
    });

    it('should accept integer when integer required', () => {
      const result = validateNumber('3', { name: 'Count', integer: true });
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 3);
    });
  });

  describe('validateIndent', () => {

    it('should return default 2 when undefined', () => {
      const result = validateIndent(undefined);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 2);
    });

    it('should accept valid indent', () => {
      const result = validateIndent('4');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 4);
    });

    it('should accept 0 indent', () => {
      const result = validateIndent('0');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 0);
    });

    it('should reject negative indent', () => {
      const result = validateIndent('-1');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('at least 0'));
    });

    it('should reject indent above 8', () => {
      const result = validateIndent('10');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('at most 8'));
    });

    it('should reject non-integer indent', () => {
      const result = validateIndent('2.5');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('integer'));
    });
  });

  describe('validateVersion', () => {

    it('should accept undefined (optional)', () => {
      const result = validateVersion(undefined);
      assert.strictEqual(result.valid, true);
    });

    it('should accept major.minor format', () => {
      const result = validateVersion('1.0');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, '1.0');
    });

    it('should accept major.minor.patch format', () => {
      const result = validateVersion('1.2.3');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, '1.2.3');
    });

    it('should reject invalid version format', () => {
      const result = validateVersion('v1.0');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Invalid version format'));
    });

    it('should reject single number', () => {
      const result = validateVersion('1');
      assert.strictEqual(result.valid, false);
    });

    it('should reject text version', () => {
      const result = validateVersion('latest');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validateQueryExpression', () => {

    it('should require expression', () => {
      const result = validateQueryExpression(undefined);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('required'));
    });

    it('should accept valid expression', () => {
      const result = validateQueryExpression('users[0].name');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'users[0].name');
    });

    it('should block __proto__ access', () => {
      const result = validateQueryExpression('obj.__proto__');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('blocked'));
    });

    it('should block constructor access', () => {
      const result = validateQueryExpression('obj.constructor');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('blocked'));
    });

    it('should block prototype access', () => {
      const result = validateQueryExpression('obj.prototype');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('blocked'));
    });

    it('should reject expression over 1000 chars', () => {
      const longExpr = 'a'.repeat(1001);
      const result = validateQueryExpression(longExpr);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('maximum length'));
    });

    it('should accept expression at 1000 chars', () => {
      const expr = 'a'.repeat(1000);
      const result = validateQueryExpression(expr);
      assert.strictEqual(result.valid, true);
    });
  });

  describe('validateAll', () => {

    it('should return valid when all validations pass', () => {
      const result = validateAll([
        { valid: true, value: 'a' },
        { valid: true, value: 'b' },
        { valid: true, value: 'c' }
      ]);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should collect all errors', () => {
      const result = validateAll([
        { valid: true, value: 'a' },
        { valid: false, error: 'Error 1' },
        { valid: true, value: 'b' },
        { valid: false, error: 'Error 2' }
      ]);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 2);
      assert.ok(result.errors.includes('Error 1'));
      assert.ok(result.errors.includes('Error 2'));
    });

    it('should handle empty array', () => {
      const result = validateAll([]);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should skip validations without error messages', () => {
      const result = validateAll([
        { valid: false }, // No error message
        { valid: false, error: 'Real error' }
      ]);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 1);
    });
  });
});
