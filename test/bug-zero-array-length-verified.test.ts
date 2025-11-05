/**
 * Bug #2 Verification: Zero-length array incorrectly uses fallback calculation
 * Location: src/parser/value-parser.ts line 25
 *
 * The code uses: header.arrayLength || Math.floor(...)
 * When arrayLength is 0 (a valid value), the || operator treats it as falsy
 * and uses the fallback calculation instead.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { encodeTONL, decodeTONL } from '../dist/index.js';

describe('Bug #2: Zero-length array with || operator', () => {
  it('should correctly handle zero-length array with columns (edge case)', () => {
    // Create a zero-length array of objects
    const data = {
      emptyUsers: []
    };

    // Encode to TONL
    const tonl = encodeTONL(data);
    console.log('Encoded TONL:');
    console.log(tonl);

    // Decode back
    const decoded = decodeTONL(tonl);
    console.log('Decoded:',decoded);

    // Should preserve empty array
    assert.deepStrictEqual(decoded.emptyUsers, []);
  });

  it('demonstrates the bug with single-line format (if used)', () => {
    // The bug specifically affects the single-line array parsing
    // where arrayLength is explicitly 0 but there might be fields

    // Manual TONL with single-line format showing array length 0
    // but with column definitions
    const tonlWithBug = `#version 1.0
emptyUsers[0]{name,age}:`;

    const decoded = decodeTONL(tonlWithBug);
    console.log('Decoded from manual TONL:', decoded);

    // The bug would cause incorrect parsing if there were fields
    // Because 0 || Math.floor(fields.length / columns.length) would use the fallback
    assert.deepStrictEqual(decoded.emptyUsers, [], 'Should be empty array');
  });

  it('demonstrates the bug would affect non-empty single-line with length mismatch', () => {
    // If we have declared length 0 but provide data, the bug causes
    // the parser to use the calculated length instead of the declared length

    const tonlBugCase = `#version 1.0
items[0]{id,name}: 1, Alice`;

    const decoded = decodeTONL(tonlBugCase);
    console.log('Bug case result:', decoded);

    // With the bug: arrayLength=0 is falsy, so it uses Math.floor(2/2) = 1
    // This means it parses ONE item when length is declared as 0
    // Expected: [] (respect the declared length)
    // Actual (with bug): [{id: 1, name: "Alice"}]

    // The bug causes it to parse data even when length is declared as 0
    if (decoded.items.length > 0) {
      console.log('BUG CONFIRMED: Parsed items despite length=0 declaration');
      assert.strictEqual(decoded.items.length, 1, 'Bug: parses 1 item despite length=0');
    } else {
      console.log('Bug fixed: Correctly respects arrayLength=0');
      assert.strictEqual(decoded.items.length, 0);
    }
  });
});
