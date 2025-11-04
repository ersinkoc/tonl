/**
 * Edge case tests for TONL encode/decode
 * Tests for bugs fixed in v0.5.1
 */

import { describe, test } from "node:test";
import assert from "node:assert";
import { encodeTONL, decodeTONL } from "../dist/src/index.js";

describe("Edge Cases - Empty and Special Strings", () => {
  test("should handle empty strings correctly", () => {
    const data = { empty: '', notEmpty: 'x', nullVal: null };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(decoded.empty, '');
    assert.strictEqual(decoded.notEmpty, 'x');
    assert.strictEqual(decoded.nullVal, null);
  });

  test("should preserve whitespace characters", () => {
    const data = {
      tabs: '\t\ttext',
      spaces: '  text  ',
      newlines: 'line1\nline2\nline3'
      // Note: Mixed whitespace at end of multiline strings is a known edge case
    };
    const decoded = decodeTONL(encodeTONL(data));

    assert.strictEqual(decoded.tabs, data.tabs);
    assert.strictEqual(decoded.spaces, data.spaces);
    assert.strictEqual(decoded.newlines, data.newlines);
  });

  test("should handle triple quotes in content", () => {
    const data = { text: 'Has """ triple quotes """ inside' };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(decoded.text, data.text);
  });
});

describe("Edge Cases - Boolean and Null Strings", () => {
  test("should distinguish boolean strings from booleans", () => {
    const data = {
      trueStr: 'true',
      falseStr: 'false',
      trueBool: true,
      falseBool: false
    };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(typeof decoded.trueStr, 'string');
    assert.strictEqual(decoded.trueStr, 'true');
    assert.strictEqual(typeof decoded.trueBool, 'boolean');
    assert.strictEqual(decoded.trueBool, true);
  });

  test("should distinguish null strings from null values", () => {
    const data = {
      nullStr: 'null',
      undefinedStr: 'undefined',
      nullVal: null
    };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(typeof decoded.nullStr, 'string');
    assert.strictEqual(decoded.nullStr, 'null');
    assert.strictEqual(decoded.nullVal, null);
  });
});

describe("Edge Cases - Numeric Types", () => {
  test("should handle scientific notation", () => {
    const data = {
      large: 1.23e10,
      small: -4.56e-7,
      zero: 0e0
    };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(typeof decoded.large, 'number');
    assert.strictEqual(decoded.large, data.large);
    assert.strictEqual(typeof decoded.small, 'number');
    assert.strictEqual(decoded.small, data.small);
  });

  test("should handle Infinity and NaN", () => {
    const data = {
      inf: Infinity,
      ninf: -Infinity,
      nan: NaN
    };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(decoded.inf, Infinity);
    assert.strictEqual(decoded.ninf, -Infinity);
    assert.ok(Number.isNaN(decoded.nan));
  });

  test("should distinguish Infinity/NaN strings from values", () => {
    const data = {
      infStr: 'Infinity',
      nanStr: 'NaN',
      infNum: Infinity,
      nanNum: NaN
    };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(typeof decoded.infStr, 'string');
    assert.strictEqual(decoded.infStr, 'Infinity');
    assert.strictEqual(typeof decoded.infNum, 'number');
    assert.strictEqual(decoded.infNum, Infinity);
  });

  test("should infer correct types for number bounds", async () => {
    const { inferPrimitiveType } = await import("../dist/src/infer.js");
    
    // u32 range: 0 to 4294967295
    assert.strictEqual(inferPrimitiveType(0), 'u32');
    assert.strictEqual(inferPrimitiveType(0xFFFFFFFF), 'u32');
    assert.strictEqual(inferPrimitiveType(0xFFFFFFFF + 1), 'f64');
    
    // i32 range: -2147483648 to 2147483647
    assert.strictEqual(inferPrimitiveType(-1), 'i32');
    assert.strictEqual(inferPrimitiveType(-0x80000000), 'i32');
    assert.strictEqual(inferPrimitiveType(-0x80000000 - 1), 'f64');
    
    // Large integers
    assert.strictEqual(inferPrimitiveType(9007199254740991), 'f64');
  });
});

describe("Edge Cases - Objects and Arrays", () => {
  test("should handle root-level primitive arrays", () => {
    const arr = [1, 2, 3, null, 5];
    const decoded = decodeTONL(encodeTONL(arr));
    
    assert.ok(Array.isArray(decoded));
    assert.strictEqual(decoded.length, 5);
    assert.deepStrictEqual(decoded, arr);
  });

  test("should handle objects with numeric keys", () => {
    const data = { '0': 'zero', '1': 'one', '10': 'ten' };
    const decoded = decodeTONL(encodeTONL(data));
    
    assert.strictEqual(decoded['0'], 'zero');
    assert.strictEqual(decoded['1'], 'one');
    assert.strictEqual(decoded['10'], 'ten');
  });

  test("should detect circular references in objects", () => {
    const circular: any = { a: 1 };
    circular.self = circular;
    
    assert.throws(
      () => encodeTONL(circular),
      /Circular reference detected/
    );
  });

  test("should detect circular references in arrays", () => {
    const arr: any[] = [1, 2];
    arr.push(arr);
    
    assert.throws(
      () => encodeTONL(arr),
      /Circular reference detected/
    );
  });
});

describe("Edge Cases - Comments and Directives", () => {
  test("should handle @ directive lines", () => {
    const tonl = `@tonl v1

order{orderId,status}:
  orderId: ORD-001
  status: processing`;
    
    const decoded = decodeTONL(tonl);
    assert.strictEqual(decoded.order.orderId, 'ORD-001');
    assert.strictEqual(decoded.order.status, 'processing');
  });

  test("should handle # comment lines", () => {
    const tonl = `#version 1.0

# This is a comment
data{value}:
  value: 123`;
    
    const decoded = decodeTONL(tonl);
    assert.strictEqual(decoded.data.value, 123);
  });
});
