/**
 * Property-Based Tests for Type Inference (Task 008)
 *
 * Tests type inference consistency using fast-check.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import { inferPrimitiveType, inferTypeFromString, coerceValue } from '../../dist/infer.js';
import { encodeTONL, decodeTONL } from '../../dist/index.js';

// ============================================================
// Property Tests
// ============================================================

describe('Type Inference Property Tests', () => {

  describe('inferPrimitiveType (JavaScript values)', () => {

    it('infers "null" for null value', () => {
      const result = inferPrimitiveType(null);
      assert.strictEqual(result, 'null');
    });

    it('infers "bool" for boolean values', async () => {
      await fc.assert(
        fc.property(fc.boolean(), (value) => {
          const result = inferPrimitiveType(value);
          assert.strictEqual(result, 'bool');
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('infers integer types for integers', async () => {
      await fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (num) => {
            const result = inferPrimitiveType(num);
            // Should be u32 for positive integers in range
            assert.strictEqual(result, 'u32');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('infers "f64" for floating point numbers', async () => {
      await fc.assert(
        fc.property(
          fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 })
            .filter(n => !Number.isInteger(n)),
          (num) => {
            const result = inferPrimitiveType(num);
            assert.strictEqual(result, 'f64');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('infers "str" for strings', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (str) => {
            const result = inferPrimitiveType(str);
            assert.strictEqual(result, 'str');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('infers "list" for arrays', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 0, maxLength: 10 }),
          (arr) => {
            const result = inferPrimitiveType(arr);
            assert.strictEqual(result, 'list');
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('infers "obj" for objects', async () => {
      await fc.assert(
        fc.property(
          fc.object({ maxDepth: 1, maxKeys: 5 }),
          (obj) => {
            const result = inferPrimitiveType(obj);
            assert.strictEqual(result, 'obj');
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('inferTypeFromString (string parsing)', () => {

    it('infers "null" for null string', () => {
      const result = inferTypeFromString('null');
      assert.strictEqual(result, 'null');
    });

    it('infers "bool" for true/false strings', async () => {
      await fc.assert(
        fc.property(fc.constantFrom('true', 'false'), (value) => {
          const result = inferTypeFromString(value);
          assert.strictEqual(result, 'bool');
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('infers integer type for integer strings', async () => {
      await fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (num) => {
            const str = String(num);
            const result = inferTypeFromString(str);
            // Positive integers in range should be u32
            assert.strictEqual(result, 'u32');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('infers "f64" for decimal strings', async () => {
      await fc.assert(
        fc.property(
          fc.double({ noNaN: true, noDefaultInfinity: true, min: 0.01, max: 1e6 })
            .filter(n => !Number.isInteger(n)),
          (num) => {
            // Format with explicit decimal point
            const str = num.toFixed(6);
            const result = inferTypeFromString(str);
            assert.strictEqual(result, 'f64');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('infers "str" for non-special strings', async () => {
      // Generate strings that don't look like numbers, booleans, or null
      const nonSpecialString = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter(s => /^[A-Za-z][A-Za-z0-9 _-]*$/.test(s))
        .filter(s => !['true', 'false', 'null'].includes(s.toLowerCase()));

      await fc.assert(
        fc.property(nonSpecialString, (value) => {
          const result = inferTypeFromString(value);
          assert.strictEqual(result, 'str');
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('coerceValue Consistency', () => {

    it('coerces to number (f64) correctly', async () => {
      // Use safe floating point range that won't trigger precision issues
      await fc.assert(
        fc.property(
          fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 })
            .filter(n => Math.abs(n) > 1e-10 || n === 0), // Filter out denormalized numbers
          (num) => {
            const str = String(num);
            // Skip scientific notation that might cause precision issues
            if (/[eE]/.test(str) && Math.abs(num) > Number.MAX_SAFE_INTEGER) {
              return true;
            }
            const result = coerceValue(str, 'f64');
            // Handle floating point comparison
            assert.ok(Math.abs(result as number - num) < 1e-10 || result === num);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('coerces to boolean correctly', async () => {
      await fc.assert(
        fc.property(fc.boolean(), (bool) => {
          const str = String(bool);
          const result = coerceValue(str, 'bool');
          assert.strictEqual(result, bool);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('coerces "null" to null', () => {
      const result = coerceValue('null', 'null');
      assert.strictEqual(result, null);
    });

    it('coerces to string preserves value', async () => {
      // Filter out strings that start/end with quotes (they get special handling)
      await fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 })
            .filter(s => !s.startsWith('"') && !s.endsWith('"')),
          (str) => {
            const result = coerceValue(str, 'str');
            assert.strictEqual(result, str);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Round-Trip Type Preservation', () => {

    it('numbers preserve their type through encoding', async () => {
      await fc.assert(
        fc.property(
          fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 }),
          (num) => {
            const encoded = encodeTONL({ value: num });
            const decoded = decodeTONL(encoded) as { value: number };
            assert.strictEqual(typeof decoded.value, 'number');
            // Handle floating point precision
            assert.ok(Math.abs(decoded.value - num) < 1e-10 || decoded.value === num);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('integers preserve their type through encoding', async () => {
      await fc.assert(
        fc.property(
          fc.integer({ min: -1000000, max: 1000000 }),
          (num) => {
            const encoded = encodeTONL({ value: num });
            const decoded = decodeTONL(encoded) as { value: number };
            assert.strictEqual(typeof decoded.value, 'number');
            assert.strictEqual(decoded.value, num);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('booleans preserve their type through encoding', async () => {
      await fc.assert(
        fc.property(fc.boolean(), (bool) => {
          const encoded = encodeTONL({ value: bool });
          const decoded = decodeTONL(encoded) as { value: boolean };
          assert.strictEqual(typeof decoded.value, 'boolean');
          assert.strictEqual(decoded.value, bool);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('null preserves through encoding', () => {
      const encoded = encodeTONL({ value: null });
      const decoded = decodeTONL(encoded) as { value: null };
      assert.strictEqual(decoded.value, null);
    });

    it('strings preserve their value through encoding', async () => {
      // Safe strings that won't be confused with other types
      const safeString = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter(s => /^[A-Za-z][A-Za-z0-9 _-]*$/.test(s));

      await fc.assert(
        fc.property(safeString, (str) => {
          const encoded = encodeTONL({ value: str });
          const decoded = decodeTONL(encoded) as { value: string };
          assert.strictEqual(typeof decoded.value, 'string');
          assert.strictEqual(decoded.value, str);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Array Type Consistency', () => {

    it('arrays of same type preserve types', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 20 }),
          (arr) => {
            const encoded = encodeTONL({ items: arr });
            const decoded = decodeTONL(encoded) as { items: number[] };
            assert.strictEqual(decoded.items.length, arr.length);
            for (let i = 0; i < arr.length; i++) {
              assert.strictEqual(typeof decoded.items[i], 'number');
              assert.strictEqual(decoded.items[i], arr[i]);
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('arrays of booleans preserve types', async () => {
      await fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
          (arr) => {
            const encoded = encodeTONL({ flags: arr });
            const decoded = decodeTONL(encoded) as { flags: boolean[] };
            assert.strictEqual(decoded.flags.length, arr.length);
            for (let i = 0; i < arr.length; i++) {
              assert.strictEqual(typeof decoded.flags[i], 'boolean');
              assert.strictEqual(decoded.flags[i], arr[i]);
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Mixed Type Objects', () => {

    it('objects with mixed types preserve all types', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            num: fc.integer({ min: -1000, max: 1000 }),
            bool: fc.boolean(),
            isNull: fc.constant(null),
            str: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z]+$/.test(s))
          }),
          (obj) => {
            const encoded = encodeTONL(obj);
            const decoded = decodeTONL(encoded) as typeof obj;

            assert.strictEqual(typeof decoded.num, 'number');
            assert.strictEqual(decoded.num, obj.num);

            assert.strictEqual(typeof decoded.bool, 'boolean');
            assert.strictEqual(decoded.bool, obj.bool);

            assert.strictEqual(decoded.isNull, null);

            assert.strictEqual(typeof decoded.str, 'string');
            assert.strictEqual(decoded.str, obj.str);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
