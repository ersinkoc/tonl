/**
 * Schema parser and validator tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSchema, validateTONL } from '../dist/src/schema/index.js';

describe('Schema parser', () => {
  it('should parse basic schema with primitives', () => {
    const schemaContent = `@schema v1
@strict true

name: str required min:2 max:100
age: u32 required min:0 max:150
email: str required pattern:email
`;

    const schema = parseSchema(schemaContent);

    assert.strictEqual(schema.directives.version, 'v1');
    assert.strictEqual(schema.directives.strict, true);
    assert.strictEqual(schema.rootFields.length, 3);

    // Check name field
    const nameField = schema.rootFields[0];
    assert.strictEqual(nameField.name, 'name');
    assert.strictEqual(nameField.type.kind, 'primitive');
    assert.ok(nameField.constraints.some(c => c.type === 'required'));
  });

  it('should parse custom type definition', () => {
    const schemaContent = `@schema v1

User: obj
  id: u32 required
  name: str required min:2

users: list<User>
`;

    const schema = parseSchema(schemaContent);

    assert.ok(schema.customTypes.has('User'));
    const userType = schema.customTypes.get('User');
    assert.strictEqual(userType?.fields?.length, 2);

    // Check root field
    assert.strictEqual(schema.rootFields.length, 1);
    const usersField = schema.rootFields[0];
    assert.strictEqual(usersField.type.kind, 'complex');
  });
});

describe('Schema validator', () => {
  it('should validate valid data', () => {
    const schemaContent = `@schema v1

name: str required
age: u32 required
`;

    const schema = parseSchema(schemaContent);
    const data = {
      name: 'John',
      age: 30
    };

    const result = validateTONL(data, schema);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('should detect missing required field', () => {
    const schemaContent = `@schema v1

name: str required
age: u32 required
`;

    const schema = parseSchema(schemaContent);
    const data = {
      name: 'John'
      // age is missing
    };

    const result = validateTONL(data, schema);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.errors.length, 1);
    assert.ok(result.errors[0].message.includes('required'));
  });

  it('should validate string constraints', () => {
    const schemaContent = `@schema v1

username: str required min:3 max:20
`;

    const schema = parseSchema(schemaContent);

    // Too short
    const data1 = { username: 'ab' };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Valid
    const data2 = { username: 'john' };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });

  it('should validate numeric constraints', () => {
    const schemaContent = `@schema v1

age: u32 required min:0 max:150
`;

    const schema = parseSchema(schemaContent);

    // Out of range
    const data1 = { age: 200 };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, false);

    // Valid
    const data2 = { age: 25 };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, true);
  });

  it('should validate list types', () => {
    const schemaContent = `@schema v1

tags: list<str> required min:1 max:5
`;

    const schema = parseSchema(schemaContent);

    // Valid
    const data1 = { tags: ['tag1', 'tag2'] };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, true);

    // Too many items
    const data2 = { tags: ['a', 'b', 'c', 'd', 'e', 'f'] };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, false);
  });

  it('should validate custom types', () => {
    const schemaContent = `@schema v1

User: obj
  id: u32 required
  name: str required min:2

user: User required
`;

    const schema = parseSchema(schemaContent);

    // Valid
    const data1 = {
      user: {
        id: 1,
        name: 'John'
      }
    };
    const result1 = validateTONL(data1, schema);
    assert.strictEqual(result1.valid, true);

    // Missing field
    const data2 = {
      user: {
        id: 1
        // name missing
      }
    };
    const result2 = validateTONL(data2, schema);
    assert.strictEqual(result2.valid, false);
  });
});
