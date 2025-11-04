/**
 * Schema constraint validation tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSchema, validateTONL } from '../dist/schema/index.js';

describe('Schema constraints - unique', () => {
  it('should detect duplicate values in array', () => {
    const schemaContent = `@schema v1

tags: list<str> unique:true
`;

    const schema = parseSchema(schemaContent);

    // Has duplicates
    const data1 = { tags: ['a', 'b', 'a'] };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);
    assert.ok(result1.errors[0].message.includes('duplicate'));

    // All unique
    const data2 = { tags: ['a', 'b', 'c'] };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });
});

describe('Schema constraints - nonempty', () => {
  it('should reject empty arrays', () => {
    const schemaContent = `@schema v1

items: list<str> nonempty:true
`;

    const schema = parseSchema(schemaContent);

    // Empty array
    const data1 = { items: [] };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Non-empty
    const data2 = { items: ['item1'] };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });
});

describe('Schema constraints - numeric', () => {
  it('should validate positive constraint', () => {
    const schemaContent = `@schema v1

count: i32 positive:true
`;

    const schema = parseSchema(schemaContent);

    // Negative
    const data1 = { count: -5 };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Positive
    const data2 = { count: 10 };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });

  it('should validate integer constraint', () => {
    const schemaContent = `@schema v1

quantity: f64 integer:true
`;

    const schema = parseSchema(schemaContent);

    // Float
    const data1 = { quantity: 3.14 };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Integer
    const data2 = { quantity: 42 };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });

  it('should validate multipleOf constraint', () => {
    const schemaContent = `@schema v1

price: f64 multipleOf:0.01
`;

    const schema = parseSchema(schemaContent);

    // Not multiple
    const data1 = { price: 10.123 };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Valid multiple
    const data2 = { price: 10.99 };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });
});

describe('Schema constraints - length', () => {
  it('should validate exact string length', () => {
    const schemaContent = `@schema v1

code: str length:6
`;

    const schema = parseSchema(schemaContent);

    // Wrong length
    const data1 = { code: 'ABC' };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Correct length
    const data2 = { code: 'ABC123' };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });
});
