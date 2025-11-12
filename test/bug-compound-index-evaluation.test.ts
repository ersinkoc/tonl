/**
 * BUG-002: Compound Index Field Evaluation Bug Test
 *
 * Severity: CRITICAL
 *
 * Description: When building compound indices, the code evaluates field paths
 * against the root document instead of the current object being indexed. This
 * causes all compound index entries to reference the same values repeatedly.
 *
 * File affected:
 * - src/indexing/index-manager.ts:84 - Uses this.document instead of current object
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { TONLDocument } from '../dist/document.js';

test('BUG-002: Compound index uses root document instead of current object', () => {
  const doc = TONLDocument.fromJSON({
    users: [
      { id: 1, name: 'Alice', age: 25, role: 'admin' },
      { id: 2, name: 'Bob', age: 30, role: 'user' },
      { id: 3, name: 'Charlie', age: 35, role: 'user' }
    ]
  });

  // Create compound index on name + age
  doc.createCompoundIndex('nameAge', ['name', 'age']);

  const index = doc.getIndex('nameAge');
  assert.ok(index, 'Index should exist');

  // Get index statistics
  const stats = index.stats();
  console.log('Index stats:', stats);

  // BUG: All three users should be indexed with different [name, age] pairs
  // But because of the bug, they all get the same values from root evaluation
  // Expected: 3 different compound keys
  // Actual: All entries might have the same key or incorrect values

  // Try to verify by checking if we can find each user by their compound key
  // This would fail if all entries have the same key
  const aliceKey = ['Alice', 25];
  const bobKey = ['Bob', 30];
  const charlieKey = ['Charlie', 35];

  const alicePaths = index.find(aliceKey);
  const bobPaths = index.find(bobKey);
  const charliePaths = index.find(charlieKey);

  console.log('Alice paths:', alicePaths);
  console.log('Bob paths:', bobPaths);
  console.log('Charlie paths:', charliePaths);

  // Each user should be findable by their unique compound key
  assert.ok(alicePaths && alicePaths.length > 0,
    'Alice should be findable by [Alice, 25]');
  assert.ok(bobPaths && bobPaths.length > 0,
    'Bob should be findable by [Bob, 30]');
  assert.ok(charliePaths && charliePaths.length > 0,
    'Charlie should be findable by [Charlie, 35]');

  // Each should have exactly one result
  assert.strictEqual(alicePaths.length, 1, 'Alice should have one entry');
  assert.strictEqual(bobPaths.length, 1, 'Bob should have one entry');
  assert.strictEqual(charliePaths.length, 1, 'Charlie should have one entry');
});

test('BUG-002: Compound index with nested paths', () => {
  const doc = TONLDocument.fromJSON({
    employees: [
      { id: 1, profile: { firstName: 'Alice', lastName: 'Smith' }, dept: 'Engineering' },
      { id: 2, profile: { firstName: 'Bob', lastName: 'Jones' }, dept: 'Sales' },
      { id: 3, profile: { firstName: 'Charlie', lastName: 'Brown' }, dept: 'Engineering' }
    ]
  });

  // Create compound index on nested paths
  doc.createCompoundIndex('nameDept', ['profile.firstName', 'dept']);

  const index = doc.getIndex('nameDept');
  const stats = index.stats();

  console.log('Nested path index stats:', stats);

  // Should be able to find each employee by their unique combination
  const aliceKey = ['Alice', 'Engineering'];
  const bobKey = ['Bob', 'Sales'];
  const charlieKey = ['Charlie', 'Engineering'];

  const alicePaths = index.find(aliceKey);
  const bobPaths = index.find(bobKey);
  const charliePaths = index.find(charlieKey);

  assert.ok(alicePaths && alicePaths.length > 0,
    'Should find Alice by [Alice, Engineering]');
  assert.ok(bobPaths && bobPaths.length > 0,
    'Should find Bob by [Bob, Sales]');
  assert.ok(charliePaths && charliePaths.length > 0,
    'Should find Charlie by [Charlie, Engineering]');
});

test('BUG-002: Verify different compound keys are stored', () => {
  const doc = TONLDocument.fromJSON({
    products: [
      { id: 'A1', category: 'Electronics', price: 299 },
      { id: 'B2', category: 'Books', price: 29 },
      { id: 'C3', category: 'Electronics', price: 599 }
    ]
  });

  doc.createCompoundIndex('catPrice', ['category', 'price']);

  const index = doc.getIndex('catPrice');
  const stats = index.stats();

  // Should have 3 unique entries (even though 2 share 'Electronics' category)
  // If bug exists, all might map to same key
  assert.strictEqual(stats.size, 3,
    'Index should contain 3 distinct compound keys');

  // Verify each product is indexed correctly
  const a1Paths = index.find(['Electronics', 299]);
  const b2Paths = index.find(['Books', 29]);
  const c3Paths = index.find(['Electronics', 599]);

  assert.strictEqual(a1Paths?.length, 1, 'A1 should have one entry');
  assert.strictEqual(b2Paths?.length, 1, 'B2 should have one entry');
  assert.strictEqual(c3Paths?.length, 1, 'C3 should have one entry');

  // Searching for wrong combinations should return nothing
  const wrongKey = index.find(['Books', 599]);
  assert.strictEqual(wrongKey?.length || 0, 0,
    'Wrong combination should return no results');
});

test('BUG-002: Compound index should use object-local values', () => {
  const doc = TONLDocument.fromJSON({
    orders: [
      { orderId: 100, customerId: 'C1', amount: 50 },
      { orderId: 101, customerId: 'C2', amount: 75 },
      { orderId: 102, customerId: 'C1', amount: 100 }
    ]
  });

  doc.createCompoundIndex('customerAmount', ['customerId', 'amount']);

  const index = doc.getIndex('customerAmount');

  // Order 100: ['C1', 50]
  // Order 101: ['C2', 75]
  // Order 102: ['C1', 100]

  const order100 = index.find(['C1', 50]);
  const order101 = index.find(['C2', 75]);
  const order102 = index.find(['C1', 100]);

  assert.ok(order100 && order100.length === 1,
    'Order 100 should be indexed as [C1, 50]');
  assert.ok(order101 && order101.length === 1,
    'Order 101 should be indexed as [C2, 75]');
  assert.ok(order102 && order102.length === 1,
    'Order 102 should be indexed as [C1, 100]');

  // Verify the paths point to correct orders
  assert.ok(order100[0].includes('0'), 'Should point to orders[0]');
  assert.ok(order101[0].includes('1'), 'Should point to orders[1]');
  assert.ok(order102[0].includes('2'), 'Should point to orders[2]');
});
