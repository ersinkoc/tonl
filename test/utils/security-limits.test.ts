/**
 * Security Limits Tests (Task 013)
 *
 * Tests for centralized security limits module
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DEFAULT_SECURITY_LIMITS,
  createSecurityLimits,
  validateSecurityLimits,
  MAX_LINE_LENGTH,
  MAX_BUFFER_SIZE,
  MAX_NESTING_DEPTH,
} from '../../dist/utils/security-limits.js';

describe('Security Limits', () => {
  describe('DEFAULT_SECURITY_LIMITS', () => {
    it('should export all required limits', () => {
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_LINE_LENGTH === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_FIELDS_PER_LINE === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_NESTING_DEPTH === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_INPUT_SIZE === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_JSON_SIZE === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_REGEX_PATTERN_LENGTH === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_REGEX_NESTING_DEPTH === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_QUERY_DEPTH === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_ITERATIONS === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_BUFFER_SIZE === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_BLOCK_LINES === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_INDENT === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_STRING_LENGTH === 'number');
      assert.ok(typeof DEFAULT_SECURITY_LIMITS.MAX_ENCODE_DEPTH === 'number');
    });

    it('should have expected default values', () => {
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_LINE_LENGTH, 100_000);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_FIELDS_PER_LINE, 10_000);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_NESTING_DEPTH, 100);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_INPUT_SIZE, 10 * 1024 * 1024);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_BUFFER_SIZE, 10 * 1024 * 1024);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_BLOCK_LINES, 10_000);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_REGEX_PATTERN_LENGTH, 100);
      assert.strictEqual(DEFAULT_SECURITY_LIMITS.MAX_REGEX_NESTING_DEPTH, 3);
    });

    it('should be frozen (immutable)', () => {
      assert.ok(Object.isFrozen(DEFAULT_SECURITY_LIMITS));
    });
  });

  describe('Individual constant exports', () => {
    it('should export individual constants matching defaults', () => {
      assert.strictEqual(MAX_LINE_LENGTH, DEFAULT_SECURITY_LIMITS.MAX_LINE_LENGTH);
      assert.strictEqual(MAX_BUFFER_SIZE, DEFAULT_SECURITY_LIMITS.MAX_BUFFER_SIZE);
      assert.strictEqual(MAX_NESTING_DEPTH, DEFAULT_SECURITY_LIMITS.MAX_NESTING_DEPTH);
    });
  });

  describe('createSecurityLimits', () => {
    it('should allow custom limits', () => {
      const custom = createSecurityLimits({ MAX_NESTING_DEPTH: 50 });
      assert.strictEqual(custom.MAX_NESTING_DEPTH, 50);
      assert.strictEqual(custom.MAX_LINE_LENGTH, 100_000); // default preserved
    });

    it('should preserve all defaults when no overrides', () => {
      const custom = createSecurityLimits({});
      assert.deepStrictEqual(custom, { ...DEFAULT_SECURITY_LIMITS });
    });

    it('should allow multiple overrides', () => {
      const custom = createSecurityLimits({
        MAX_NESTING_DEPTH: 50,
        MAX_BUFFER_SIZE: 5 * 1024 * 1024,
        MAX_BLOCK_LINES: 5000,
      });
      assert.strictEqual(custom.MAX_NESTING_DEPTH, 50);
      assert.strictEqual(custom.MAX_BUFFER_SIZE, 5 * 1024 * 1024);
      assert.strictEqual(custom.MAX_BLOCK_LINES, 5000);
    });
  });

  describe('validateSecurityLimits', () => {
    it('should pass for valid default limits', () => {
      assert.doesNotThrow(() => {
        validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS });
      });
    });

    it('should reject invalid MAX_NESTING_DEPTH', () => {
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_NESTING_DEPTH: 0 }),
        /MAX_NESTING_DEPTH/
      );
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_NESTING_DEPTH: 2000 }),
        /MAX_NESTING_DEPTH/
      );
    });

    it('should reject invalid MAX_INPUT_SIZE', () => {
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_INPUT_SIZE: 100 }),
        /MAX_INPUT_SIZE/
      );
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_INPUT_SIZE: 200 * 1024 * 1024 }),
        /MAX_INPUT_SIZE/
      );
    });

    it('should reject invalid MAX_BUFFER_SIZE', () => {
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_BUFFER_SIZE: 100 }),
        /MAX_BUFFER_SIZE/
      );
    });

    it('should reject invalid MAX_REGEX_PATTERN_LENGTH', () => {
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_REGEX_PATTERN_LENGTH: 5 }),
        /MAX_REGEX_PATTERN_LENGTH/
      );
    });

    it('should reject invalid MAX_BLOCK_LINES', () => {
      assert.throws(
        () => validateSecurityLimits({ ...DEFAULT_SECURITY_LIMITS, MAX_BLOCK_LINES: 10 }),
        /MAX_BLOCK_LINES/
      );
    });
  });
});
