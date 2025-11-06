/**
 * Test case for Bug #1: Negative Array Index Handling
 *
 * This test verifies the bug where large negative indices that normalize
 * to negative values are not properly handled in the setter.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TONLDocument } from '../dist/document.js';

describe('Bug #1: Negative Array Index Handling in Setter', () => {
  test('should throw error for large negative index that normalizes to negative', () => {
    const doc = TONLDocument.fromJSON({
      items: [1, 2, 3]  // length = 3
    });

    // Try to set at index -100, which normalizes to -97 (3 + (-100))
    // This should throw an error, not silently fail or corrupt the array
    assert.throws(
      () => {
        doc.set('items[-100]', 'corrupted');
      },
      {
        message: /out of bounds|index/i
      },
      'Should throw error for negative normalized index'
    );

    // Verify array is not corrupted
    const items = doc.get('items') as number[];
    assert.strictEqual(items.length, 3, 'Array length should remain 3');
    assert.strictEqual(items[0], 1, 'First element should be unchanged');
    assert.strictEqual(items[1], 2, 'Second element should be unchanged');
    assert.strictEqual(items[2], 3, 'Third element should be unchanged');

    // Verify no properties were added to the array
    const keys = Object.keys(items);
    assert.strictEqual(keys.length, 3, 'Array should only have numeric indices');
  });

  test('should throw error for large negative index with createPath enabled', () => {
    const data = {
      items: [1, 2, 3]
    };

    // Even with createPath, large negative indices should fail
    assert.throws(
      () => {
        const doc = TONLDocument.fromJSON(data);
        doc.set('items[-100]', 'value', { createPath: true });
      },
      {
        message: /out of bounds|index/i
      },
      'Should throw error even with createPath enabled'
    );
  });

  test('should handle valid negative indices correctly', () => {
    const doc = TONLDocument.fromJSON({
      items: [1, 2, 3]
    });

    // -1 should work (last element)
    doc.set('items[-1]', 99);
    assert.strictEqual(doc.get('items[2]'), 99, 'items[-1] should set last element');

    // -2 should work (second to last)
    doc.set('items[-2]', 88);
    assert.strictEqual(doc.get('items[1]'), 88, 'items[-2] should set second to last element');

    // -3 should work (first element)
    doc.set('items[-3]', 77);
    assert.strictEqual(doc.get('items[0]'), 77, 'items[-3] should set first element');
  });

  test('should throw for negative index that is one past bounds', () => {
    const doc = TONLDocument.fromJSON({
      items: [1, 2, 3]
    });

    // -4 normalizes to -1, which is out of bounds
    assert.throws(
      () => {
        doc.set('items[-4]', 'value');
      },
      {
        message: /out of bounds|index/i
      },
      'Should throw for -4 on array of length 3'
    );
  });
});
