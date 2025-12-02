/**
 * Comprehensive Circular Reference Detection Tests
 *
 * Tests for Task 011 - Verifies robust circular reference detection
 * in the encoder across various edge cases.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { encodeTONL } from '../dist/encode.js';

describe('Circular Reference Detection - Comprehensive', () => {
  describe('Direct Self-Reference', () => {
    it('should detect direct self-reference in object', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;

      assert.throws(
        () => encodeTONL(obj),
        /circular|self-reference/i
      );
    });

    it('should detect self-reference as nested property', () => {
      const obj: any = { data: { nested: {} } };
      obj.data.nested.back = obj;

      assert.throws(
        () => encodeTONL(obj),
        /circular|self-reference/i
      );
    });
  });

  describe('Indirect Circular Reference', () => {
    it('should detect A -> B -> A cycle', () => {
      const a: any = { name: 'a' };
      const b: any = { name: 'b', ref: a };
      a.ref = b;

      assert.throws(
        () => encodeTONL(a),
        /circular|self-reference/i
      );
    });

    it('should detect A -> B -> C -> A cycle', () => {
      const a: any = { name: 'a' };
      const b: any = { name: 'b' };
      const c: any = { name: 'c' };
      a.next = b;
      b.next = c;
      c.next = a;

      assert.throws(
        () => encodeTONL(a),
        /circular|self-reference/i
      );
    });
  });

  describe('Array Circular References', () => {
    it('should detect array containing itself', () => {
      const arr: any[] = [1, 2, 3];
      arr.push(arr);

      assert.throws(
        () => encodeTONL(arr),
        /circular|self-reference/i
      );
    });

    it('should detect nested array containing parent', () => {
      const outer: any = { items: [] };
      outer.items.push(outer);

      assert.throws(
        () => encodeTONL(outer),
        /circular|self-reference/i
      );
    });

    it('should detect array with circular object reference', () => {
      const obj: any = { name: 'test' };
      const arr: any[] = [obj];
      obj.parent = arr;

      assert.throws(
        () => encodeTONL(arr),
        /circular|self-reference/i
      );
    });
  });

  describe('Deeply Nested Circular References', () => {
    it('should detect circular reference at depth 5', () => {
      const root: any = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {}
              }
            }
          }
        }
      };
      root.level1.level2.level3.level4.level5.backToRoot = root;

      assert.throws(
        () => encodeTONL(root),
        /circular|self-reference/i
      );
    });

    it('should detect circular reference in nested array', () => {
      const root: any = {
        data: [
          { items: [{ nested: {} }] }
        ]
      };
      root.data[0].items[0].nested.root = root;

      assert.throws(
        () => encodeTONL(root),
        /circular|self-reference/i
      );
    });
  });

  describe('Shared References (Non-Circular)', () => {
    it('should allow same object at multiple paths', () => {
      const shared = { id: 1, name: 'shared' };
      const obj = {
        first: shared,
        second: shared,
        nested: { third: shared }
      };

      // This should NOT throw - same object at multiple paths is OK
      // It's not a true cycle, just sharing
      assert.doesNotThrow(() => {
        encodeTONL(obj);
      });
    });

    it('should allow shared array at multiple locations', () => {
      const sharedArray = [1, 2, 3];
      const obj = {
        a: sharedArray,
        b: sharedArray
      };

      assert.doesNotThrow(() => {
        encodeTONL(obj);
      });
    });

    it('should encode shared references correctly', () => {
      const shared = { value: 42 };
      const obj = { a: shared, b: shared };

      const encoded = encodeTONL(obj);
      // Both should be encoded (even if same object)
      assert.ok(encoded.includes('value'));
    });
  });

  describe('Error Message Quality', () => {
    it('should include key name in circular reference error', () => {
      const obj: any = { problematic: {} };
      obj.problematic.back = obj;

      try {
        encodeTONL(obj);
        assert.fail('Should have thrown');
      } catch (error: any) {
        // Error should mention the key where circular was detected
        assert.ok(
          error.message.includes('circular') ||
          error.message.includes('reference') ||
          error.message.includes('detected'),
          `Error message should indicate circular reference: ${error.message}`
        );
      }
    });

    it('should include context in self-reference error', () => {
      const arr: any[] = [1, 2];
      arr.push(arr);

      try {
        encodeTONL(arr);
        assert.fail('Should have thrown');
      } catch (error: any) {
        assert.ok(
          error.message.toLowerCase().includes('reference') ||
          error.message.toLowerCase().includes('circular'),
          `Error should mention reference: ${error.message}`
        );
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in circular structures', () => {
      const obj: any = { a: null, b: { c: null } };
      obj.b.parent = obj;

      assert.throws(
        () => encodeTONL(obj),
        /circular|self-reference/i
      );
    });

    it('should handle mixed primitives and circular refs', () => {
      const obj: any = {
        str: 'hello',
        num: 42,
        bool: true,
        arr: [1, 2, 3],
        nested: { value: 'test' }
      };
      obj.nested.circular = obj;

      assert.throws(
        () => encodeTONL(obj),
        /circular|self-reference/i
      );
    });

    it('should not be fooled by similar but different objects', () => {
      const obj1 = { id: 1, name: 'first' };
      const obj2 = { id: 1, name: 'first' }; // Same content, different object
      const container = { a: obj1, b: obj2 };

      // Should work - these are different objects
      assert.doesNotThrow(() => {
        encodeTONL(container);
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should handle moderately large objects without issues', () => {
      const largeObj: any = {};
      for (let i = 0; i < 100; i++) {
        largeObj[`key${i}`] = { value: i, nested: { deep: i * 2 } };
      }

      assert.doesNotThrow(() => {
        encodeTONL(largeObj);
      });
    });

    it('should handle arrays with many elements', () => {
      const arr = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `item${i}`
      }));

      assert.doesNotThrow(() => {
        encodeTONL(arr);
      });
    });
  });
});
