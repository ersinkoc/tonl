/**
 * Security Tests: Aggregator Prototype Pollution Protection
 *
 * Tests for Task 003 - Ensures aggregation functions cannot be used
 * to access dangerous prototype chain properties.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { aggregate, AggregationResult } from '../../dist/query/aggregators.js';

describe('Aggregator Prototype Pollution Protection', () => {
  const testData = [
    { id: 1, name: 'Alice', age: 30, country: 'TR' },
    { id: 2, name: 'Bob', age: 25, country: 'US' },
    { id: 3, name: 'Charlie', age: 35, country: 'TR' },
  ];

  describe('groupBy Protection', () => {
    it('should block groupBy with __proto__', () => {
      assert.throws(
        () => aggregate(testData).groupBy('__proto__'),
        /prototype pollution/
      );
    });

    it('should block groupBy with constructor', () => {
      assert.throws(
        () => aggregate(testData).groupBy('constructor'),
        /prototype pollution/
      );
    });

    it('should block groupBy with prototype', () => {
      assert.throws(
        () => aggregate(testData).groupBy('prototype'),
        /prototype pollution/
      );
    });

    it('should allow groupBy with normal fields', () => {
      const result = aggregate(testData).groupBy('country');
      assert.ok(result);
      assert.strictEqual(result['TR'].length, 2);
      assert.strictEqual(result['US'].length, 1);
    });
  });

  describe('sum Protection', () => {
    it('should block sum with __proto__', () => {
      assert.throws(
        () => aggregate(testData).sum('__proto__'),
        /prototype pollution/
      );
    });

    it('should block sum with constructor', () => {
      assert.throws(
        () => aggregate(testData).sum('constructor'),
        /prototype pollution/
      );
    });

    it('should allow sum with normal fields', () => {
      const result = aggregate(testData).sum('age');
      assert.strictEqual(result, 90); // 30 + 25 + 35
    });
  });

  describe('avg Protection', () => {
    it('should block avg with __proto__', () => {
      assert.throws(
        () => aggregate(testData).avg('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow avg with normal fields', () => {
      const result = aggregate(testData).avg('age');
      assert.strictEqual(result, 30); // (30 + 25 + 35) / 3
    });
  });

  describe('min Protection', () => {
    it('should block min with __proto__', () => {
      assert.throws(
        () => aggregate(testData).min('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow min with normal fields', () => {
      const result = aggregate(testData).min('age');
      assert.strictEqual(result, 25);
    });
  });

  describe('max Protection', () => {
    it('should block max with __proto__', () => {
      assert.throws(
        () => aggregate(testData).max('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow max with normal fields', () => {
      const result = aggregate(testData).max('age');
      assert.strictEqual(result, 35);
    });
  });

  describe('distinct Protection', () => {
    it('should block distinct with __proto__', () => {
      assert.throws(
        () => aggregate(testData).distinct('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow distinct with normal fields', () => {
      const result = aggregate(testData).distinct('country');
      assert.deepStrictEqual(result.sort(), ['TR', 'US']);
    });
  });

  describe('stats Protection', () => {
    it('should block stats with __proto__', () => {
      assert.throws(
        () => aggregate(testData).stats('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow stats with normal fields', () => {
      const result = aggregate(testData).stats('age');
      assert.strictEqual(result.count, 3);
      assert.strictEqual(result.sum, 90);
      assert.strictEqual(result.min, 25);
      assert.strictEqual(result.max, 35);
    });
  });

  describe('orderBy Protection', () => {
    it('should block orderBy with __proto__', () => {
      assert.throws(
        () => aggregate(testData).orderBy('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow orderBy with normal fields', () => {
      const result = aggregate(testData).orderBy('age').toArray();
      assert.strictEqual(result[0].age, 25);
      assert.strictEqual(result[2].age, 35);
    });
  });

  describe('frequency Protection', () => {
    it('should block frequency with __proto__', () => {
      assert.throws(
        () => aggregate(testData).frequency('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow frequency with normal fields', () => {
      const result = aggregate(testData).frequency('country');
      assert.strictEqual(result['TR'], 2);
      assert.strictEqual(result['US'], 1);
    });
  });

  describe('percentile Protection', () => {
    it('should block percentile with __proto__', () => {
      assert.throws(
        () => aggregate(testData).percentile(50, '__proto__'),
        /prototype pollution/
      );
    });

    it('should allow percentile with normal fields', () => {
      const result = aggregate(testData).percentile(50, 'age');
      assert.strictEqual(result, 30);
    });
  });

  describe('median Protection', () => {
    it('should block median with __proto__', () => {
      assert.throws(
        () => aggregate(testData).median('__proto__'),
        /prototype pollution/
      );
    });

    it('should allow median with normal fields', () => {
      const result = aggregate(testData).median('age');
      assert.strictEqual(result, 30);
    });
  });

  describe('All Dangerous Properties Blocked', () => {
    const dangerousProperties = [
      '__proto__',
      'constructor',
      'prototype',
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
    ];

    for (const prop of dangerousProperties) {
      it(`should block '${prop}' in groupBy`, () => {
        assert.throws(
          () => aggregate(testData).groupBy(prop),
          /prototype pollution/,
          `Expected '${prop}' to be blocked`
        );
      });
    }
  });

  describe('Nested Field Protection', () => {
    const nestedData = [
      { user: { profile: { name: 'Alice' } } },
      { user: { profile: { name: 'Bob' } } },
    ];

    it('should block __proto__ in nested path', () => {
      assert.throws(
        () => aggregate(nestedData).groupBy('user.__proto__.name'),
        /prototype pollution/
      );
    });

    it('should block constructor in nested path', () => {
      assert.throws(
        () => aggregate(nestedData).groupBy('user.constructor.name'),
        /prototype pollution/
      );
    });

    it('should allow normal nested paths', () => {
      const result = aggregate(nestedData).groupBy('user.profile.name');
      assert.ok(result['Alice']);
      assert.ok(result['Bob']);
    });
  });

  describe('Missing Field Handling', () => {
    it('should handle missing fields gracefully', () => {
      const result = aggregate(testData).sum('nonexistent');
      assert.strictEqual(result, 0);
    });

    it('should handle null items gracefully', () => {
      const dataWithNull = [
        { age: 30 },
        null as any,
        { age: 25 },
      ];
      const result = aggregate(dataWithNull).sum('age');
      assert.strictEqual(result, 55);
    });
  });
});
