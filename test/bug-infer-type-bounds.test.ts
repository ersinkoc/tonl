/**
 * Bug Test (FIXED): inferTypeFromString bounds checking
 * Location: src/infer.ts lines 160-180
 *
 * BUG WAS: The function returned u32/i32 for integer strings without checking bounds.
 * FIX: Added proper bounds checking like inferPrimitiveType.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { inferTypeFromString, inferPrimitiveType } from '../dist/infer.js';

describe('Bug #1 FIXED: inferTypeFromString bounds checking', () => {
  it('should return f64 for integers that exceed u32 max (4294967295)', () => {
    const hugePositive = '9999999999999'; // Way beyond u32 max
    const result = inferTypeFromString(hugePositive);

    console.log(`inferTypeFromString("${hugePositive}") = "${result}"`);

    // FIXED: Now correctly returns f64
    assert.strictEqual(result, 'f64', 'Fixed: Returns f64 for huge numbers');
  });

  it('should return f64 for integers that exceed i32 min (-2147483648)', () => {
    const hugeNegative = '-9999999999999'; // Way beyond i32 min
    const result = inferTypeFromString(hugeNegative);

    console.log(`inferTypeFromString("${hugeNegative}") = "${result}"`);

    // FIXED: Now correctly returns f64
    assert.strictEqual(result, 'f64', 'Fixed: Returns f64 for huge negative numbers');
  });

  it('should return u32 for integers within u32 range', () => {
    const largePositive = '3000000000'; // Beyond i32 max but within u32
    const result = inferTypeFromString(largePositive);

    console.log(`inferTypeFromString("${largePositive}") = "${result}"`);

    // This should correctly return u32 since it's in range
    assert.strictEqual(result, 'u32');
  });

  it('should be consistent with inferPrimitiveType', () => {
    const hugeNum = 9999999999999;
    const primitiveType = inferPrimitiveType(hugeNum);
    const stringType = inferTypeFromString(String(hugeNum));

    console.log(`Consistency check: inferPrimitiveType(${hugeNum}) = "${primitiveType}"`);
    console.log(`                   inferTypeFromString("${hugeNum}") = "${stringType}"`);

    // FIXED: Now they agree
    assert.strictEqual(primitiveType, stringType, 'Fixed: Functions now agree on type');
  });
});
