/**
 * BUG-001: MISSING_FIELD_MARKER Data Corruption Test
 *
 * Status: FIXED
 *
 * Description: The MISSING_FIELD_MARKER was changed from "-" to "" (empty string)
 * to avoid collision with legitimate user data containing "-".
 *
 * Resolution:
 * - Missing fields use empty string marker (unquoted trailing delimiter)
 * - Explicit empty strings are quoted as ""
 * - Dash "-" values are preserved correctly
 *
 * Files:
 * - src/types.ts - MISSING_FIELD_MARKER = ""
 * - src/encode.ts - Encodes missing fields as empty (nothing after delimiter)
 * - src/parser/block-parser.ts - Skips empty fields (missing marker)
 *
 * Task 016: Added edge case tests for empty string handling
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { encodeTONL, decodeTONL } from '../dist/index.js';

test('BUG-001: MISSING_FIELD_MARKER collision with user data "-"', () => {
  // User has legitimate "-" value in their data
  const originalData = {
    items: [
      { name: 'Alice', status: '-' },  // Legitimate "-" value
      { name: 'Bob', status: 'active' },
      { name: 'Charlie' }  // Missing status field
    ]
  };

  // Encode to TONL
  const tonlText = encodeTONL(originalData);
  console.log('Encoded TONL:');
  console.log(tonlText);

  // Decode back to JavaScript
  const decodedData = decodeTONL(tonlText);
  console.log('\nDecoded data:');
  console.log(JSON.stringify(decodedData, null, 2));

  // BUG: Alice's status should be "-" but gets dropped
  assert.strictEqual(decodedData.items[0].status, '-',
    'FAILED: Alice status "-" was dropped during round-trip');

  // Bob's status should be preserved
  assert.strictEqual(decodedData.items[1].status, 'active',
    'Bob status should be preserved');

  // Charlie should not have a status field
  assert.strictEqual('status' in decodedData.items[2], false,
    'Charlie should not have status field');
});

test('BUG-001: Multiple fields with "-" value', () => {
  const originalData = {
    records: [
      { id: 1, code: '-', note: 'placeholder', flag: '-' },
      { id: 2, code: 'ABC', note: '-', flag: 'Y' },
      { id: 3, code: '-', note: '-', flag: '-' }
    ]
  };

  const tonlText = encodeTONL(originalData);
  const decodedData = decodeTONL(tonlText);

  // All "-" values should be preserved
  assert.strictEqual(decodedData.records[0].code, '-');
  assert.strictEqual(decodedData.records[0].flag, '-');
  assert.strictEqual(decodedData.records[1].note, '-');
  assert.strictEqual(decodedData.records[2].code, '-');
  assert.strictEqual(decodedData.records[2].note, '-');
  assert.strictEqual(decodedData.records[2].flag, '-');
});

test('BUG-001: Distinguish "-" from missing fields', () => {
  const originalData = {
    users: [
      { name: 'Alice', middleName: '-', lastName: 'Smith' },  // Explicit "-"
      { name: 'Bob', lastName: 'Jones' }  // Missing middleName
    ]
  };

  const tonlText = encodeTONL(originalData);
  const decodedData = decodeTONL(tonlText);

  // Alice should have middleName = "-"
  assert.strictEqual(decodedData.users[0].middleName, '-',
    'Alice middleName should be "-"');

  // Bob should NOT have middleName field at all
  assert.strictEqual('middleName' in decodedData.users[1], false,
    'Bob should not have middleName field');
});

test('BUG-001: "-" in different delimiters', () => {
  const testData = {
    items: [
      { a: '-', b: 'x' },
      { a: 'y', b: '-' }
    ]
  };

  // Test with comma delimiter
  const tonlComma = encodeTONL(testData, { delimiter: ',' });
  const decodedComma = decodeTONL(tonlComma);
  assert.strictEqual(decodedComma.items[0].a, '-');
  assert.strictEqual(decodedComma.items[1].b, '-');

  // Test with pipe delimiter
  const tonlPipe = encodeTONL(testData, { delimiter: '|' });
  const decodedPipe = decodeTONL(tonlPipe);
  assert.strictEqual(decodedPipe.items[0].a, '-');
  assert.strictEqual(decodedPipe.items[1].b, '-');

  // Test with tab delimiter
  const tonlTab = encodeTONL(testData, { delimiter: '\t' });
  const decodedTab = decodeTONL(tonlTab);
  assert.strictEqual(decodedTab.items[0].a, '-');
  assert.strictEqual(decodedTab.items[1].b, '-');
});

test('BUG-001: Edge case - array of all "-" values', () => {
  const originalData = {
    flags: [
      { value: '-' },
      { value: '-' },
      { value: '-' }
    ]
  };

  const tonlText = encodeTONL(originalData);
  const decodedData = decodeTONL(tonlText);

  // All values should be "-", not missing
  assert.strictEqual(decodedData.flags.length, 3);
  assert.strictEqual(decodedData.flags[0].value, '-');
  assert.strictEqual(decodedData.flags[1].value, '-');
  assert.strictEqual(decodedData.flags[2].value, '-');
});

// ============================================================
// Empty String Edge Cases (Task 016)
// ============================================================

test('Empty string in simple key-value format is preserved', () => {
  // Simple key-value format properly preserves empty strings
  const original = { name: '', age: 30 };
  const encoded = encodeTONL(original);
  const decoded = decodeTONL(encoded);

  assert.strictEqual('name' in decoded, true, 'Empty string field should exist');
  assert.strictEqual(decoded.name, '', 'Empty string should be preserved');
  assert.strictEqual(decoded.age, 30);
});

test('Empty string with other string values', () => {
  // Multiple string fields including empty
  const original = { a: '', b: 'hello', c: '', d: 'world' };
  const encoded = encodeTONL(original);
  const decoded = decodeTONL(encoded);

  assert.strictEqual(decoded.a, '');
  assert.strictEqual(decoded.b, 'hello');
  assert.strictEqual(decoded.c, '');
  assert.strictEqual(decoded.d, 'world');
});

test('Null vs empty string distinction', () => {
  // Null and empty string should be distinguished
  const original = { emptyStr: '', nullVal: null, hasValue: 'test' };
  const encoded = encodeTONL(original);
  const decoded = decodeTONL(encoded);

  assert.strictEqual(decoded.emptyStr, '', 'Empty string preserved');
  assert.strictEqual(decoded.nullVal, null, 'Null preserved');
  assert.strictEqual(decoded.hasValue, 'test', 'String preserved');
});

test('Missing field vs null vs empty in tables', () => {
  // Test distinctions in tabular format
  const original = {
    items: [
      { a: 'x', b: null, c: 'z' },      // b is explicit null
      { a: 'x', c: 'z' },                // b is missing
    ]
  };

  const encoded = encodeTONL(original);
  const decoded = decodeTONL(encoded);

  // First row: b should be null
  assert.strictEqual(decoded.items[0].b, null, 'Explicit null preserved');

  // Second row: b should be missing (not in object)
  assert.strictEqual('b' in decoded.items[1], false, 'Missing field not added');
});

test('Empty string in nested object', () => {
  const original = {
    user: {
      name: '',
      email: 'test@example.com'
    }
  };

  const encoded = encodeTONL(original);
  const decoded = decodeTONL(encoded);

  assert.strictEqual(decoded.user.name, '', 'Nested empty string preserved');
  assert.strictEqual(decoded.user.email, 'test@example.com');
});

test('Encoding explicitly quotes empty strings', () => {
  // Verify the encoder outputs quoted empty strings
  const original = { name: '', value: 'test' };
  const encoded = encodeTONL(original);

  // The encoded output should contain "" for the empty string
  assert.ok(encoded.includes('""'), 'Empty string should be quoted in output');
});
