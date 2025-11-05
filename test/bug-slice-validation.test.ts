/**
 * Bug #3: Slice validation doesn't account for negative indices
 * Location: src/query/validator.ts line 140
 *
 * The validator checks: if (node.start > node.end)
 * but doesn't account for negative indices which need conversion first.
 * For example: [5:-2] looks like start > end but it's actually valid.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parsePath } from '../dist/query/path-parser.js';
import { validate } from '../dist/query/validator.js';

describe('Bug #3 FIXED: Slice validation with negative indices', () => {
  it('should validate slice [5:-2] as valid', () => {
    const path = '$[5:-2]';
    const parsed = parsePath(path);

    if (!parsed.success) {
      throw new Error(`Failed to parse: ${parsed.error?.message}`);
    }

    const result = validate(parsed.ast);
    console.log(`Validating "${path}":`, result);

    // FIXED: Now correctly validates as valid
    assert.strictEqual(result.valid, true, 'Fixed: Validator correctly accepts [5:-2]');
    assert.strictEqual(result.errors.length, 0, 'Should have no errors');
  });

  it('should validate slice [2:-2] as valid', () => {
    const path = '$[2:-2]';
    const parsed = parsePath(path);

    if (!parsed.success) {
      throw new Error(`Failed to parse: ${parsed.error?.message}`);
    }

    const result = validate(parsed.ast);
    console.log(`Validating "${path}":`, result);

    // FIXED: Now correctly validates as valid
    assert.strictEqual(result.valid, true, 'Fixed: Validator correctly accepts [2:-2]');
  });

  it('should validate slice [-5:-2] as valid', () => {
    const path = '$[-5:-2]';
    const parsed = parsePath(path);

    if (!parsed.success) {
      throw new Error(`Failed to parse: ${parsed.error?.message}`);
    }

    const result = validate(parsed.ast);
    console.log(`Validating "${path}":`, result);

    // This should pass because -5 < -2 numerically
    assert.strictEqual(result.valid, true, 'Slice with both negative indices should be valid');
  });

  it('should correctly reject invalid slice [5:2] (without step)', () => {
    const path = '$[5:2]';
    const parsed = parsePath(path);

    if (!parsed.success) {
      throw new Error(`Failed to parse: ${parsed.error?.message}`);
    }

    const result = validate(parsed.ast);
    console.log(`Validating "${path}":`, result);

    // This truly is invalid: from index 5 to index 2 (going backwards without negative step)
    assert.strictEqual(result.valid, false, 'Slice [5:2] should be invalid');
  });

  it('should allow slice [5:2:-1] with negative step', () => {
    const path = '$[5:2:-1]';
    const parsed = parsePath(path);

    if (!parsed.success) {
      throw new Error(`Failed to parse: ${parsed.error?.message}`);
    }

    const result = validate(parsed.ast);
    console.log(`Validating "${path}":`, result);

    // FIXED: With negative step, start > end is now correctly validated as valid
    assert.strictEqual(result.valid, true, 'Fixed: Validator allows start > end with negative step');
  });
});
