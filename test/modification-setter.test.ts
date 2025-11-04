/**
 * Test suite for Core Setter Implementation (T011)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TONLDocument } from '../dist/index.js';

describe('Core Setter - T011', () => {
  describe('Basic Set Operations', () => {
    test('should set simple property', () => {
      const doc = TONLDocument.fromJSON({ user: { name: 'Alice' } });
      doc.set('user.name', 'Bob');
      assert.strictEqual(doc.get('user.name'), 'Bob');
    });

    test('should set nested property', () => {
      const doc = TONLDocument.fromJSON({ user: { profile: { age: 30 } } });
      doc.set('user.profile.age', 31);
      assert.strictEqual(doc.get('user.profile.age'), 31);
    });

    test('should set array element', () => {
      const doc = TONLDocument.fromJSON({ items: [1, 2, 3] });
      doc.set('items[0]', 10);
      assert.strictEqual(doc.get('items[0]'), 10);
    });

    test('should set array element property', () => {
      const doc = TONLDocument.fromJSON({
        users: [{ id: 1, name: 'Alice' }]
      });
      doc.set('users[0].name', 'Bob');
      assert.strictEqual(doc.get('users[0].name'), 'Bob');
    });

    test('should support method chaining', () => {
      const doc = TONLDocument.fromJSON({ a: 1, b: 2 });
      doc.set('a', 10).set('b', 20);
      assert.strictEqual(doc.get('a'), 10);
      assert.strictEqual(doc.get('b'), 20);
    });
  });

  describe('Create Intermediate Paths', () => {
    test('should create intermediate objects', () => {
      const doc = TONLDocument.fromJSON({});
      doc.set('user.profile.age', 30);
      assert.strictEqual(doc.get('user.profile.age'), 30);
    });

    test('should create intermediate arrays', () => {
      const doc = TONLDocument.fromJSON({});
      doc.set('items[0]', 'first');
      assert.strictEqual(doc.get('items[0]'), 'first');
    });

    test('should create deep nested structure', () => {
      const doc = TONLDocument.fromJSON({});
      doc.set('a.b.c.d.e', 'value');
      assert.strictEqual(doc.get('a.b.c.d.e'), 'value');
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative array index', () => {
      const doc = TONLDocument.fromJSON({ items: [1, 2, 3] });
      doc.set('items[-1]', 99);
      assert.strictEqual(doc.get('items[-1]'), 99);
    });

    test('should update existing value', () => {
      const doc = TONLDocument.fromJSON({ count: 5 });
      doc.set('count', 10);
      assert.strictEqual(doc.get('count'), 10);
    });

    test('should set null value', () => {
      const doc = TONLDocument.fromJSON({ value: 'something' });
      doc.set('value', null);
      assert.strictEqual(doc.get('value'), null);
    });

    test('should set boolean value', () => {
      const doc = TONLDocument.fromJSON({ active: false });
      doc.set('active', true);
      assert.strictEqual(doc.get('active'), true);
    });

    test('should set object value', () => {
      const doc = TONLDocument.fromJSON({ data: {} });
      doc.set('data', { key: 'value' });
      assert.deepStrictEqual(doc.get('data'), { key: 'value' });
    });
  });
});
