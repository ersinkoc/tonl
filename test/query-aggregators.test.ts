/**
 * Tests for Aggregation Functions
 *
 * Tests count, sum, avg, min, max, groupBy, distinct, and other aggregation operations.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { TONLDocument } from '../dist/document.js';
import { aggregate, agg, AggregationResult } from '../dist/query/aggregators.js';

describe('Aggregation Functions', () => {
  describe('aggregate() factory function', () => {
    it('should create AggregationResult from array', () => {
      const result = aggregate([1, 2, 3]);
      assert.ok(result instanceof AggregationResult);
    });

    it('should handle empty arrays', () => {
      const result = aggregate([]);
      assert.strictEqual(result.count(), 0);
    });

    it('should handle non-array input', () => {
      const result = aggregate(null as any);
      assert.strictEqual(result.count(), 0);
    });
  });

  describe('count()', () => {
    it('should count array elements', () => {
      assert.strictEqual(aggregate([1, 2, 3, 4, 5]).count(), 5);
    });

    it('should count objects in array', () => {
      const users = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }];
      assert.strictEqual(aggregate(users).count(), 3);
    });

    it('should return 0 for empty array', () => {
      assert.strictEqual(aggregate([]).count(), 0);
    });
  });

  describe('sum()', () => {
    it('should sum numeric array', () => {
      assert.strictEqual(aggregate([1, 2, 3, 4, 5]).sum(), 15);
    });

    it('should sum field values from objects', () => {
      const orders = [
        { total: 100 },
        { total: 200 },
        { total: 300 }
      ];
      assert.strictEqual(aggregate(orders).sum('total'), 600);
    });

    it('should ignore non-numeric values', () => {
      assert.strictEqual(aggregate([1, 'two', 3, null, 5]).sum(), 9);
    });

    it('should return 0 for empty array', () => {
      assert.strictEqual(aggregate([]).sum(), 0);
    });

    it('should handle nested field paths', () => {
      const data = [
        { order: { total: 100 } },
        { order: { total: 200 } }
      ];
      assert.strictEqual(aggregate(data).sum('order.total'), 300);
    });
  });

  describe('avg()', () => {
    it('should calculate average of numeric array', () => {
      assert.strictEqual(aggregate([1, 2, 3, 4, 5]).avg(), 3);
    });

    it('should calculate average of field values', () => {
      const products = [
        { price: 10 },
        { price: 20 },
        { price: 30 }
      ];
      assert.strictEqual(aggregate(products).avg('price'), 20);
    });

    it('should return NaN for empty array', () => {
      assert.ok(Number.isNaN(aggregate([]).avg()));
    });

    it('should handle decimal values', () => {
      assert.strictEqual(aggregate([1.5, 2.5, 3.0]).avg(), 7 / 3);
    });
  });

  describe('min()', () => {
    it('should find minimum in numeric array', () => {
      assert.strictEqual(aggregate([5, 2, 8, 1, 9]).min(), 1);
    });

    it('should find minimum field value', () => {
      const products = [
        { price: 30 },
        { price: 10 },
        { price: 20 }
      ];
      assert.strictEqual(aggregate(products).min('price'), 10);
    });

    it('should return undefined for empty array', () => {
      assert.strictEqual(aggregate([]).min(), undefined);
    });

    it('should handle string comparison', () => {
      assert.strictEqual(aggregate(['banana', 'apple', 'cherry']).min(), 'apple');
    });

    it('should handle negative numbers', () => {
      assert.strictEqual(aggregate([-5, -2, -8, -1]).min(), -8);
    });
  });

  describe('max()', () => {
    it('should find maximum in numeric array', () => {
      assert.strictEqual(aggregate([5, 2, 8, 1, 9]).max(), 9);
    });

    it('should find maximum field value', () => {
      const products = [
        { price: 30 },
        { price: 10 },
        { price: 20 }
      ];
      assert.strictEqual(aggregate(products).max('price'), 30);
    });

    it('should return undefined for empty array', () => {
      assert.strictEqual(aggregate([]).max(), undefined);
    });

    it('should handle string comparison', () => {
      assert.strictEqual(aggregate(['banana', 'apple', 'cherry']).max(), 'cherry');
    });
  });

  describe('groupBy()', () => {
    it('should group by field value', () => {
      const users = [
        { name: 'Alice', country: 'US' },
        { name: 'Bob', country: 'TR' },
        { name: 'Charlie', country: 'US' },
        { name: 'Diana', country: 'TR' }
      ];

      const groups = aggregate(users).groupBy('country');

      assert.strictEqual(Object.keys(groups).length, 2);
      assert.strictEqual(groups['US'].length, 2);
      assert.strictEqual(groups['TR'].length, 2);
    });

    it('should handle null/undefined values as __null__ group', () => {
      const items = [
        { name: 'A', category: 'X' },
        { name: 'B', category: null },
        { name: 'C' }
      ];

      const groups = aggregate(items).groupBy('category');

      assert.ok('X' in groups);
      assert.ok('__null__' in groups);
      assert.strictEqual(groups['__null__'].length, 2);
    });

    it('should handle empty array', () => {
      const groups = aggregate([]).groupBy('field');
      assert.deepStrictEqual(groups, {});
    });
  });

  describe('distinct()', () => {
    it('should get distinct values from array', () => {
      const result = aggregate([1, 2, 2, 3, 3, 3]).distinct();
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    it('should get distinct field values', () => {
      const users = [
        { country: 'US' },
        { country: 'TR' },
        { country: 'US' },
        { country: 'DE' }
      ];
      const result = aggregate(users).distinct('country');
      assert.deepStrictEqual(result.sort(), ['DE', 'TR', 'US']);
    });

    it('should handle empty array', () => {
      assert.deepStrictEqual(aggregate([]).distinct(), []);
    });

    it('should handle objects by JSON stringification', () => {
      const result = aggregate([
        { a: 1 },
        { a: 1 },
        { a: 2 }
      ]).distinct();
      assert.strictEqual(result.length, 2);
    });
  });

  describe('first() and last()', () => {
    it('should get first element', () => {
      assert.strictEqual(aggregate([1, 2, 3]).first(), 1);
    });

    it('should get last element', () => {
      assert.strictEqual(aggregate([1, 2, 3]).last(), 3);
    });

    it('should return undefined for empty array', () => {
      assert.strictEqual(aggregate([]).first(), undefined);
      assert.strictEqual(aggregate([]).last(), undefined);
    });
  });

  describe('at()', () => {
    it('should get element at index', () => {
      assert.strictEqual(aggregate([10, 20, 30]).at(1), 20);
    });

    it('should support negative index', () => {
      assert.strictEqual(aggregate([10, 20, 30]).at(-1), 30);
    });

    it('should return undefined for out of bounds', () => {
      assert.strictEqual(aggregate([1, 2, 3]).at(10), undefined);
    });
  });

  describe('take() and skip()', () => {
    it('should take first N elements', () => {
      const result = aggregate([1, 2, 3, 4, 5]).take(3).toArray();
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    it('should skip first N elements', () => {
      const result = aggregate([1, 2, 3, 4, 5]).skip(2).toArray();
      assert.deepStrictEqual(result, [3, 4, 5]);
    });

    it('should chain take and skip', () => {
      const result = aggregate([1, 2, 3, 4, 5]).skip(1).take(2).toArray();
      assert.deepStrictEqual(result, [2, 3]);
    });
  });

  describe('orderBy()', () => {
    it('should sort ascending by default', () => {
      const data = [{ age: 30 }, { age: 20 }, { age: 40 }];
      const result = aggregate(data).orderBy('age').toArray();
      assert.deepStrictEqual(result.map(d => d.age), [20, 30, 40]);
    });

    it('should sort descending', () => {
      const data = [{ age: 30 }, { age: 20 }, { age: 40 }];
      const result = aggregate(data).orderBy('age', 'desc').toArray();
      assert.deepStrictEqual(result.map(d => d.age), [40, 30, 20]);
    });

    it('should handle strings', () => {
      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      const result = aggregate(data).orderBy('name').toArray();
      assert.deepStrictEqual(result.map(d => d.name), ['Alice', 'Bob', 'Charlie']);
    });
  });

  describe('filter()', () => {
    it('should filter items', () => {
      const result = aggregate([1, 2, 3, 4, 5])
        .filter(n => n > 2)
        .toArray();
      assert.deepStrictEqual(result, [3, 4, 5]);
    });

    it('should chain with other operations', () => {
      const users = [
        { name: 'Alice', active: true },
        { name: 'Bob', active: false },
        { name: 'Charlie', active: true }
      ];
      const count = aggregate(users)
        .filter(u => u.active)
        .count();
      assert.strictEqual(count, 2);
    });
  });

  describe('map()', () => {
    it('should map items', () => {
      const result = aggregate([1, 2, 3])
        .map(n => n * 2)
        .toArray();
      assert.deepStrictEqual(result, [2, 4, 6]);
    });

    it('should chain with aggregations', () => {
      const sum = aggregate([1, 2, 3])
        .map(n => n * 2)
        .sum();
      assert.strictEqual(sum, 12);
    });
  });

  describe('reduce()', () => {
    it('should reduce to single value', () => {
      const result = aggregate([1, 2, 3, 4]).reduce((acc, n) => acc + n, 0);
      assert.strictEqual(result, 10);
    });

    it('should work with objects', () => {
      const items = [{ v: 1 }, { v: 2 }, { v: 3 }];
      const result = aggregate(items).reduce((acc, item) => acc + item.v, 0);
      assert.strictEqual(result, 6);
    });
  });

  describe('some() and every()', () => {
    it('some() should return true if any match', () => {
      assert.ok(aggregate([1, 2, 3]).some(n => n > 2));
      assert.ok(!aggregate([1, 2, 3]).some(n => n > 10));
    });

    it('every() should return true if all match', () => {
      assert.ok(aggregate([2, 4, 6]).every(n => n % 2 === 0));
      assert.ok(!aggregate([1, 2, 3]).every(n => n > 1));
    });
  });

  describe('stats()', () => {
    it('should calculate statistics', () => {
      const stats = aggregate([1, 2, 3, 4, 5]).stats();

      assert.strictEqual(stats.count, 5);
      assert.strictEqual(stats.sum, 15);
      assert.strictEqual(stats.avg, 3);
      assert.strictEqual(stats.min, 1);
      assert.strictEqual(stats.max, 5);
      assert.ok(stats.variance >= 0);
      assert.ok(stats.stdDev >= 0);
    });

    it('should calculate field statistics', () => {
      const data = [{ v: 10 }, { v: 20 }, { v: 30 }];
      const stats = aggregate(data).stats('v');

      assert.strictEqual(stats.avg, 20);
    });

    it('should handle empty array', () => {
      const stats = aggregate([]).stats();
      assert.strictEqual(stats.count, 0);
      assert.ok(Number.isNaN(stats.avg));
    });
  });

  describe('partition()', () => {
    it('should partition by predicate', () => {
      const [even, odd] = aggregate([1, 2, 3, 4, 5]).partition(n => n % 2 === 0);
      assert.deepStrictEqual(even, [2, 4]);
      assert.deepStrictEqual(odd, [1, 3, 5]);
    });
  });

  describe('flatten()', () => {
    it('should flatten nested arrays', () => {
      const result = aggregate([[1, 2], [3, 4], [5]]).flatten().toArray();
      assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
    });

    it('should flatten to specified depth', () => {
      const result = aggregate([[[1, 2]], [[3, 4]]]).flatten(2).toArray();
      assert.deepStrictEqual(result, [1, 2, 3, 4]);
    });
  });

  describe('frequency()', () => {
    it('should count value frequencies', () => {
      const freq = aggregate(['a', 'b', 'a', 'c', 'a', 'b']).frequency();
      assert.strictEqual(freq['a'], 3);
      assert.strictEqual(freq['b'], 2);
      assert.strictEqual(freq['c'], 1);
    });

    it('should count field frequencies', () => {
      const data = [
        { status: 'active' },
        { status: 'inactive' },
        { status: 'active' }
      ];
      const freq = aggregate(data).frequency('status');
      assert.strictEqual(freq['active'], 2);
      assert.strictEqual(freq['inactive'], 1);
    });
  });

  describe('percentile() and median()', () => {
    it('should calculate percentile', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      assert.strictEqual(aggregate(data).percentile(50), 5.5);
      assert.strictEqual(aggregate(data).percentile(0), 1);
      assert.strictEqual(aggregate(data).percentile(100), 10);
    });

    it('should calculate median', () => {
      assert.strictEqual(aggregate([1, 2, 3, 4, 5]).median(), 3);
      assert.strictEqual(aggregate([1, 2, 3, 4]).median(), 2.5);
    });

    it('should return undefined for empty array', () => {
      assert.strictEqual(aggregate([]).median(), undefined);
    });
  });

  describe('agg shorthand functions', () => {
    it('should provide count shorthand', () => {
      assert.strictEqual(agg.count([1, 2, 3]), 3);
    });

    it('should provide sum shorthand', () => {
      assert.strictEqual(agg.sum([1, 2, 3]), 6);
    });

    it('should provide avg shorthand', () => {
      assert.strictEqual(agg.avg([1, 2, 3]), 2);
    });

    it('should provide groupBy shorthand', () => {
      const users = [{ c: 'US' }, { c: 'TR' }];
      const groups = agg.groupBy(users, 'c');
      assert.ok('US' in groups);
      assert.ok('TR' in groups);
    });
  });
});

describe('TONLDocument Aggregation Methods', () => {
  let doc: TONLDocument;

  before(() => {
    doc = TONLDocument.fromJSON({
      users: [
        { name: 'Alice', age: 30, country: 'US', active: true },
        { name: 'Bob', age: 25, country: 'TR', active: false },
        { name: 'Charlie', age: 35, country: 'US', active: true },
        { name: 'Diana', age: 28, country: 'DE', active: true }
      ],
      orders: [
        { id: 1, total: 100, status: 'completed' },
        { id: 2, total: 200, status: 'pending' },
        { id: 3, total: 150, status: 'completed' }
      ],
      tags: ['js', 'ts', 'js', 'node', 'ts']
    });
  });

  describe('doc.aggregate()', () => {
    it('should return AggregationResult', () => {
      const result = doc.aggregate('users[*]');
      assert.ok(result instanceof AggregationResult);
    });

    it('should allow chained operations', () => {
      const activeUsers = doc.aggregate('users[*]')
        .filter((u: any) => u.active)
        .count();
      assert.strictEqual(activeUsers, 3);
    });
  });

  describe('doc.count()', () => {
    it('should count query results', () => {
      assert.strictEqual(doc.count('users[*]'), 4);
    });

    it('should count filtered results', () => {
      assert.strictEqual(doc.count('users[?(@.active)]'), 3);
    });
  });

  describe('doc.sum()', () => {
    it('should sum field values', () => {
      assert.strictEqual(doc.sum('orders[*]', 'total'), 450);
    });

    it('should sum ages', () => {
      assert.strictEqual(doc.sum('users[*]', 'age'), 118);
    });
  });

  describe('doc.avg()', () => {
    it('should calculate average', () => {
      assert.strictEqual(doc.avg('users[*]', 'age'), 118 / 4);
    });
  });

  describe('doc.min() and doc.max()', () => {
    it('should find minimum age', () => {
      assert.strictEqual(doc.min('users[*]', 'age'), 25);
    });

    it('should find maximum age', () => {
      assert.strictEqual(doc.max('users[*]', 'age'), 35);
    });
  });

  describe('doc.groupBy()', () => {
    it('should group by country', () => {
      const groups = doc.groupBy('users[*]', 'country');
      assert.strictEqual(groups['US'].length, 2);
      assert.strictEqual(groups['TR'].length, 1);
      assert.strictEqual(groups['DE'].length, 1);
    });

    it('should group by status', () => {
      const groups = doc.groupBy('orders[*]', 'status');
      assert.strictEqual(groups['completed'].length, 2);
      assert.strictEqual(groups['pending'].length, 1);
    });
  });

  describe('doc.distinct()', () => {
    it('should get distinct values', () => {
      const countries = doc.distinct('users[*]', 'country');
      assert.strictEqual(countries.length, 3);
      assert.ok(countries.includes('US'));
      assert.ok(countries.includes('TR'));
      assert.ok(countries.includes('DE'));
    });

    it('should get distinct array values', () => {
      const tags = doc.distinct('tags[*]');
      assert.strictEqual(tags.length, 3);
    });
  });
});
