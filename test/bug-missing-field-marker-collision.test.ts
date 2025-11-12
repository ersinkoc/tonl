/**
 * BUG-001: MISSING_FIELD_MARKER Data Corruption Test
 *
 * Severity: CRITICAL
 *
 * Description: The MISSING_FIELD_MARKER is defined as "-", which collides with
 * legitimate user data containing the exact string "-". During encode/decode
 * round-trip, user data containing "-" is silently dropped.
 *
 * Files affected:
 * - src/types.ts:18 - MISSING_FIELD_MARKER = "-"
 * - src/encode.ts:239 - Encodes missing fields as "-"
 * - src/parser/block-parser.ts:301 - Skips fields with value "-"
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
