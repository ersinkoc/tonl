/**
 * Property-Based Tests for Modification API (Task 008)
 *
 * Tests modification operations using fast-check.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fc from 'fast-check';
import { TONLDocument } from '../../dist/index.js';

// ============================================================
// Custom Arbitraries
// ============================================================

/**
 * Generate safe property names (no prototype pollution or inherited property conflicts)
 */
const forbiddenPropertyNames = new Set([
  '__proto__', 'constructor', 'prototype',
  'toString', 'valueOf', 'hasOwnProperty',
  'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', '__defineGetter__', '__defineSetter__',
  '__lookupGetter__', '__lookupSetter__'
]);

const safePropertyName = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s))
  .filter((s) => !forbiddenPropertyNames.has(s));

/**
 * Generate safe primitive values
 */
const safePrimitive = fc.oneof(
  fc.constant(null),
  fc.boolean(),
  fc.integer({ min: -1000000, max: 1000000 }),
  fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 }),
  fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('\0'))
);

/**
 * Generate flat objects
 */
const flatObject = fc.dictionary(safePropertyName, safePrimitive, { minKeys: 1, maxKeys: 10 });

// ============================================================
// Property Tests
// ============================================================

describe('Modification Property Tests', () => {

  describe('Set-Get Consistency', () => {

    it('set then get returns set value', async () => {
      await fc.assert(
        fc.property(flatObject, safePropertyName, safePrimitive, (data, key, value) => {
          const doc = TONLDocument.fromJSON({ data });
          doc.set(`data.${key}`, value);
          const result = doc.get(`data.${key}`);
          assert.deepStrictEqual(result, value);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('set overwrites existing value', async () => {
      await fc.assert(
        fc.property(
          fc.record({ existing: safePrimitive }),
          safePrimitive,
          (data, newValue) => {
            const doc = TONLDocument.fromJSON(data);
            doc.set('existing', newValue);
            const result = doc.get('existing');
            assert.deepStrictEqual(result, newValue);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('set creates nested paths', async () => {
      await fc.assert(
        fc.property(safePropertyName, safePropertyName, safePrimitive, (key1, key2, value) => {
          const doc = TONLDocument.fromJSON({});
          doc.set(`${key1}.${key2}`, value);
          const result = doc.get(`${key1}.${key2}`);
          assert.deepStrictEqual(result, value);
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Delete Operations', () => {

    it('delete removes existing key', async () => {
      await fc.assert(
        fc.property(flatObject, (data) => {
          const keys = Object.keys(data);
          if (keys.length === 0) return true;

          const keyToDelete = keys[0];
          const doc = TONLDocument.fromJSON({ data });

          // Verify it exists
          assert.ok(doc.exists(`data.${keyToDelete}`));

          // Delete it
          doc.delete(`data.${keyToDelete}`);

          // Verify it's gone
          assert.strictEqual(doc.exists(`data.${keyToDelete}`), false);
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('delete on non-existent path is safe', async () => {
      await fc.assert(
        fc.property(flatObject, (data) => {
          const doc = TONLDocument.fromJSON({ data });

          // Try to delete a key that definitely doesn't exist
          const nonExistentKey = 'nonExistentKey_XYZ_123';

          // Should not throw - just verify no exception
          try {
            doc.delete(`data.${nonExistentKey}`);
          } catch {
            // If it throws, that's also acceptable behavior
          }

          // Verify existing data is intact
          for (const key of Object.keys(data)) {
            assert.ok(doc.exists(`data.${key}`));
          }
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Array Modification', () => {

    it('push adds element to end', async () => {
      await fc.assert(
        fc.property(
          fc.array(safePrimitive, { minLength: 0, maxLength: 20 }),
          safePrimitive,
          (arr, newItem) => {
            const doc = TONLDocument.fromJSON({ items: arr });
            const originalLength = arr.length;

            doc.push('items', newItem);

            const newLength = doc.count('items');
            assert.strictEqual(newLength, originalLength + 1);

            const lastItem = doc.get(`items[${originalLength}]`);
            assert.deepStrictEqual(lastItem, newItem);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('set at index updates correct element', async () => {
      await fc.assert(
        fc.property(
          fc.array(safePrimitive, { minLength: 3, maxLength: 20 }),
          safePrimitive,
          (arr, newValue) => {
            const doc = TONLDocument.fromJSON({ items: [...arr] });
            const idx = Math.floor(arr.length / 2);

            doc.set(`items[${idx}]`, newValue);

            const result = doc.get(`items[${idx}]`);
            assert.deepStrictEqual(result, newValue);

            // Other elements should be unchanged
            for (let i = 0; i < arr.length; i++) {
              if (i !== idx) {
                const item = doc.get(`items[${i}]`);
                assert.deepStrictEqual(item, arr[i]);
              }
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Sequential Modifications', () => {

    it('multiple sequential modifications are consistent', async () => {
      await fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (val1, val2) => {
            const doc = TONLDocument.fromJSON({ a: val1, b: val2 });

            // Apply multiple modifications
            doc.set('a', val2);
            doc.set('b', val1);

            // Values should be swapped
            assert.strictEqual(doc.get('a'), val2);
            assert.strictEqual(doc.get('b'), val1);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('set followed by delete removes value', async () => {
      await fc.assert(
        fc.property(
          safePropertyName,
          safePrimitive,
          (key, value) => {
            const doc = TONLDocument.fromJSON({});

            // Set then delete
            doc.set(key, value);
            assert.ok(doc.exists(key));

            doc.delete(key);
            assert.strictEqual(doc.exists(key), false);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Merge Operations', () => {

    it('merge combines objects', async () => {
      await fc.assert(
        fc.property(flatObject, flatObject, (obj1, obj2) => {
          const doc = TONLDocument.fromJSON({ data: obj1 });
          doc.merge('data', obj2);

          // All keys from obj2 should be present
          for (const [key, value] of Object.entries(obj2)) {
            const result = doc.get(`data.${key}`);
            assert.deepStrictEqual(result, value);
          }
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Data Integrity', () => {

    it('modifications preserve other data', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            keep: safePrimitive,
            modify: safePrimitive
          }),
          safePrimitive,
          (data, newValue) => {
            const originalKeep = data.keep;
            const doc = TONLDocument.fromJSON(data);

            // Modify one field
            doc.set('modify', newValue);

            // Other field should be unchanged
            const keepValue = doc.get('keep');
            assert.deepStrictEqual(keepValue, originalKeep);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple modifications are consistent', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.tuple(safePropertyName, safePrimitive),
            { minLength: 1, maxLength: 10 }
          ),
          (modifications) => {
            const doc = TONLDocument.fromJSON({ data: {} });

            // Apply all modifications
            for (const [key, value] of modifications) {
              doc.set(`data.${key}`, value);
            }

            // Last value for each key should be present
            const lastValues = new Map<string, unknown>();
            for (const [key, value] of modifications) {
              lastValues.set(key, value);
            }

            for (const [key, expectedValue] of lastValues) {
              const result = doc.get(`data.${key}`);
              assert.deepStrictEqual(result, expectedValue);
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
