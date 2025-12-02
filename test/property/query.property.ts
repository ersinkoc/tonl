/**
 * Property-Based Tests for Query System (Task 008)
 *
 * Tests query evaluation properties using fast-check.
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
 * Generate flat objects with safe keys
 */
const flatObject = fc.dictionary(safePropertyName, safePrimitive, { minKeys: 1, maxKeys: 10 });

/**
 * Generate arrays of flat objects (tabular data)
 */
const tabularData = fc.array(flatObject, { minLength: 1, maxLength: 20 });

/**
 * Generate valid array indices
 */
const validIndex = (maxLength: number) => fc.integer({ min: 0, max: Math.max(0, maxLength - 1) });

// ============================================================
// Property Tests
// ============================================================

describe('Query Property Tests', () => {

  describe('Query Idempotence', () => {

    it('querying same path twice returns same result', async () => {
      await fc.assert(
        fc.property(flatObject, safePropertyName, (data, key) => {
          // Only test if key is own property of data (not inherited)
          if (!Object.prototype.hasOwnProperty.call(data, key)) return true;

          const doc = TONLDocument.fromJSON({ root: data });
          const result1 = doc.get(`root.${key}`);
          const result2 = doc.get(`root.${key}`);
          assert.deepStrictEqual(result1, result2);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exists() is consistent with get()', async () => {
      await fc.assert(
        fc.property(flatObject, (data) => {
          // Test only with keys that actually exist in the object
          const keys = Object.keys(data);
          if (keys.length === 0) return true;

          const doc = TONLDocument.fromJSON({ data });

          // Test existing keys
          for (const key of keys) {
            const exists = doc.exists(`data.${key}`);
            const value = doc.get(`data.${key}`);
            // exists should be true for own properties
            assert.strictEqual(exists, true);
            assert.notStrictEqual(value, undefined);
          }

          // Test non-existent key
          const nonExistentKey = 'nonExistentKeyXYZ123';
          const existsNon = doc.exists(`data.${nonExistentKey}`);
          const valueNon = doc.get(`data.${nonExistentKey}`);
          assert.strictEqual(existsNon, false);
          assert.strictEqual(valueNon, undefined);

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Array Indexing Properties', () => {

    it('valid array index returns element', async () => {
      await fc.assert(
        fc.property(
          fc.array(safePrimitive, { minLength: 1, maxLength: 50 }),
          fc.nat(49),
          (arr, idx) => {
            if (idx >= arr.length) return true;

            const doc = TONLDocument.fromJSON({ items: arr });
            const result = doc.get(`items[${idx}]`);
            assert.deepStrictEqual(result, arr[idx]);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('negative index behavior is consistent', async () => {
      // Note: Negative indices in TONL queries may access from end of array
      // This test just verifies the behavior is deterministic
      await fc.assert(
        fc.property(
          fc.array(safePrimitive, { minLength: 1, maxLength: 20 }),
          fc.integer({ min: -20, max: -1 }),
          (arr, negIdx) => {
            const doc = TONLDocument.fromJSON({ items: arr });
            const result1 = doc.get(`items[${negIdx}]`);
            const result2 = doc.get(`items[${negIdx}]`);
            // Same query should return same result (idempotent)
            assert.deepStrictEqual(result1, result2);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('out of bounds index returns undefined', async () => {
      await fc.assert(
        fc.property(
          fc.array(safePrimitive, { minLength: 1, maxLength: 20 }),
          (arr) => {
            const doc = TONLDocument.fromJSON({ items: arr });
            const result = doc.get(`items[${arr.length + 10}]`);
            assert.strictEqual(result, undefined);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Wildcard Query Properties', () => {

    it('wildcard [*] returns all elements', async () => {
      await fc.assert(
        fc.property(tabularData, (data) => {
          const doc = TONLDocument.fromJSON({ users: data });
          const results = doc.query('users[*]');

          // Should return same number of results as input
          assert.strictEqual(results.length, data.length);
          return true;
        }),
        { numRuns: 50 }
      );
    });

    it('wildcard with field access returns all field values', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 1000 }),
              name: fc.string({ minLength: 1, maxLength: 20 })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (data) => {
            const doc = TONLDocument.fromJSON({ items: data });
            const ids = doc.query('items[*].id');

            // Should have same length
            assert.strictEqual(ids.length, data.length);

            // All ids should match
            for (let i = 0; i < data.length; i++) {
              assert.strictEqual(ids[i], data[i].id);
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Query Count Properties', () => {

    it('count matches array length', async () => {
      await fc.assert(
        fc.property(
          fc.array(safePrimitive, { minLength: 0, maxLength: 100 }),
          (arr) => {
            const doc = TONLDocument.fromJSON({ items: arr });
            const count = doc.count('items');
            assert.strictEqual(count, arr.length);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Deep Path Properties', () => {

    it('nested path access is consistent', async () => {
      await fc.assert(
        fc.property(
          fc.record({
            level1: fc.record({
              level2: fc.record({
                value: safePrimitive
              })
            })
          }),
          (data) => {
            const doc = TONLDocument.fromJSON(data);

            // Direct path
            const direct = doc.get('level1.level2.value');

            // Step by step
            const step1 = doc.get('level1') as any;
            const step2 = step1?.level2;
            const step3 = step2?.value;

            assert.deepStrictEqual(direct, step3);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Filter Query Properties', () => {

    it('filter with equality returns matching items', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.record({
              active: fc.boolean(),
              name: fc.string({ minLength: 1, maxLength: 10 })
            }),
            { minLength: 1, maxLength: 30 }
          ),
          (data) => {
            const doc = TONLDocument.fromJSON({ items: data });
            const activeItems = doc.query('items[?(@.active == true)]');

            // Count should match
            const expectedCount = data.filter(d => d.active === true).length;
            assert.strictEqual(activeItems.length, expectedCount);

            // All returned items should have active === true
            for (const item of activeItems) {
              assert.strictEqual((item as any).active, true);
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('filter with comparison returns correct subset', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.record({
              score: fc.integer({ min: 0, max: 100 }),
              name: fc.string({ minLength: 1, maxLength: 10 })
            }),
            { minLength: 1, maxLength: 30 }
          ),
          fc.integer({ min: 0, max: 100 }),
          (data, threshold) => {
            const doc = TONLDocument.fromJSON({ items: data });
            const highScores = doc.query(`items[?(@.score > ${threshold})]`);

            // All returned items should have score > threshold
            for (const item of highScores) {
              assert.ok((item as any).score > threshold);
            }

            // Count should match expected
            const expectedCount = data.filter(d => d.score > threshold).length;
            assert.strictEqual(highScores.length, expectedCount);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
