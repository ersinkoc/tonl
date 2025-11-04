/**
 * Streaming API tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Readable, Writable } from 'stream';
import { createEncodeStream, createDecodeStream, encodeIterator, decodeIterator } from '../dist/stream/index.js';

describe('Streaming - createEncodeStream', () => {
  it('should encode NDJSON stream to TONL', (t, done) => {
    const input = Readable.from([
      JSON.stringify({ name: 'Alice', age: 30 }) + '\n',
      JSON.stringify({ name: 'Bob', age: 25 }) + '\n'
    ]);

    const chunks: string[] = [];
    const output = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      }
    });

    input
      .pipe(createEncodeStream({ delimiter: ',' }))
      .pipe(output)
      .on('finish', () => {
        const result = chunks.join('');
        assert.ok(result.includes('name:'));
        assert.ok(result.includes('age:'));
        done();
      });
  });
});

describe('Streaming - createDecodeStream', () => {
  it('should decode TONL stream to JSON objects', (t, done) => {
    const tonlContent = `@tonl v1
name: Alice
age: 30

@tonl v1
name: Bob
age: 25`;

    const input = Readable.from([tonlContent]);
    const results: any[] = [];

    const stream = createDecodeStream();
    stream.on('data', (obj) => {
      results.push(obj);
    });

    stream.on('end', () => {
      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].name, 'Alice');
      assert.strictEqual(results[1].name, 'Bob');
      done();
    });

    input.pipe(stream);
  });
});

describe('Streaming - async iterators', () => {
  it('should encode using async iterator', async () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];

    const results: string[] = [];
    for await (const tonl of encodeIterator(data, { delimiter: ',' })) {
      results.push(tonl);
    }

    assert.strictEqual(results.length, 2);
    assert.ok(results[0].includes('Alice'));
    assert.ok(results[1].includes('Bob'));
  });

  it('should decode using async iterator', async () => {
    const tonlBlocks = [
      '@tonl v1\nname: Alice\nage: 30',
      '@tonl v1\nname: Bob\nage: 25'
    ];

    const results: any[] = [];
    for await (const obj of decodeIterator(tonlBlocks)) {
      results.push(obj);
    }

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].name, 'Alice');
    assert.strictEqual(results[1].name, 'Bob');
  });

  it('should handle empty data', async () => {
    const data: any[] = [];
    const results: string[] = [];

    for await (const tonl of encodeIterator(data)) {
      results.push(tonl);
    }

    assert.strictEqual(results.length, 0);
  });

  it('should handle special characters in stream', async () => {
    const data = [
      { text: 'Hello, "World"!' },
      { text: 'Line 1\nLine 2' }
    ];

    const results: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      results.push(tonl);
    }

    assert.strictEqual(results.length, 2);
    assert.ok(results[0].includes('text:'));

    // Verify round-trip
    const decoded: any[] = [];
    for await (const obj of decodeIterator(results)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded[0].text, 'Hello, "World"!');
    assert.strictEqual(decoded[1].text, 'Line 1\nLine 2');
  });
});

describe('Streaming - round-trip', () => {
  it('should preserve data integrity in stream round-trip', async () => {
    const originalData = [
      { id: 1, name: 'Alice', tags: ['admin', 'user'], score: 95.5 },
      { id: 2, name: 'Bob', tags: ['user'], score: 87.3 },
      { id: 3, name: 'Carol', tags: ['moderator', 'user'], score: 91.2 }
    ];

    // Encode each object separately
    const encoded: string[] = [];
    for await (const tonl of encodeIterator(originalData)) {
      encoded.push(tonl);
    }

    // Decode back
    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded.length, originalData.length);
    assert.strictEqual(decoded[0].id, 1);
    assert.strictEqual(decoded[0].name, 'Alice');
    assert.deepStrictEqual(decoded[0].tags, ['admin', 'user']);
    assert.strictEqual(decoded[0].score, 95.5);
  });

  it('should handle nested structures in stream', async () => {
    const data = [
      {
        user: {
          id: 1,
          profile: {
            name: 'Alice',
            email: 'alice@example.com'
          }
        }
      }
    ];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded.length, 1);
    assert.strictEqual(decoded[0].user.id, 1);
    assert.strictEqual(decoded[0].user.profile.name, 'Alice');
    assert.strictEqual(decoded[0].user.profile.email, 'alice@example.com');
  });

  it('should handle large arrays in stream', async () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: `item-${i}`,
      score: Math.random() * 100
    }));

    const data = [{ items: largeArray }];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded.length, 1);
    assert.strictEqual(decoded[0].items.length, 1000);
    assert.strictEqual(decoded[0].items[0].id, 0);
    assert.strictEqual(decoded[0].items[999].id, 999);
  });
});

describe('Streaming - error handling', () => {
  it('should handle invalid JSON gracefully in encode stream', (t, done) => {
    const input = Readable.from([
      JSON.stringify({ name: 'Alice' }) + '\n',
      'invalid json line\n',
      JSON.stringify({ name: 'Bob' }) + '\n'
    ]);

    const chunks: string[] = [];
    const output = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      }
    });

    input
      .pipe(createEncodeStream())
      .pipe(output)
      .on('finish', () => {
        const result = chunks.join('');
        // Should have encoded valid lines, skipped invalid
        assert.ok(result.includes('Alice'));
        assert.ok(result.includes('Bob'));
        done();
      });
  });

  it('should handle empty chunks', (t, done) => {
    const input = Readable.from(['', '\n', '  \n']);
    const results: any[] = [];

    input
      .pipe(createDecodeStream())
      .on('data', (obj) => results.push(obj))
      .on('end', () => {
        assert.strictEqual(results.length, 0);
        done();
      });
  });
});

describe('Streaming - memory efficiency', () => {
  it('should handle multiple small chunks efficiently', async () => {
    const chunks = Array.from({ length: 100 }, (_, i) => ({
      index: i,
      data: `chunk-${i}`
    }));

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(chunks)) {
      encoded.push(tonl);
    }

    assert.strictEqual(encoded.length, 100);

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded.length, 100);
    assert.strictEqual(decoded[0].index, 0);
    assert.strictEqual(decoded[99].index, 99);
  });
});

describe('Streaming - data types', () => {
  it('should handle null values in stream', async () => {
    const data = [
      { value: null },
      { value: 'string' },
      { value: 123 }
    ];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded.length, 3);
    assert.strictEqual(decoded[0].value, null);
    assert.strictEqual(decoded[1].value, 'string');
    assert.strictEqual(decoded[2].value, 123);
  });

  it('should handle boolean values in stream', async () => {
    const data = [
      { active: true, verified: false },
      { active: false, verified: true }
    ];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded[0].active, true);
    assert.strictEqual(decoded[0].verified, false);
    assert.strictEqual(decoded[1].active, false);
    assert.strictEqual(decoded[1].verified, true);
  });

  it('should handle different number types in stream', async () => {
    const data = [
      { int: 42, float: 3.14, negative: -10, zero: 0 }
    ];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded[0].int, 42);
    assert.strictEqual(decoded[0].float, 3.14);
    assert.strictEqual(decoded[0].negative, -10);
    assert.strictEqual(decoded[0].zero, 0);
  });

  it('should handle empty objects and arrays in stream', async () => {
    const data = [
      { emptyObj: {}, emptyArr: [] },
      { items: [1, 2, 3] }
    ];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data)) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded)) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded.length, 2);
    assert.deepStrictEqual(decoded[0].emptyObj, {});
    assert.deepStrictEqual(decoded[0].emptyArr, []);
    assert.deepStrictEqual(decoded[1].items, [1, 2, 3]);
  });
});

describe('Streaming - delimiter options', () => {
  it('should respect delimiter option in stream encoding', async () => {
    const data = [{ a: 1, b: 2, c: 3 }];

    const encodedPipe: string[] = [];
    for await (const tonl of encodeIterator(data, { delimiter: '|' })) {
      encodedPipe.push(tonl);
    }

    assert.ok(encodedPipe[0].includes('|') || !encodedPipe[0].includes(','));
  });

  it('should handle smart encoding in stream', async () => {
    const data = [
      { field1: 'value,with,commas', field2: 'normal' }
    ];

    const encoded: string[] = [];
    for await (const tonl of encodeIterator(data, { delimiter: '|' })) {
      encoded.push(tonl);
    }

    const decoded: any[] = [];
    for await (const obj of decodeIterator(encoded, { delimiter: '|' })) {
      decoded.push(obj);
    }

    assert.strictEqual(decoded[0].field1, 'value,with,commas');
  });
});
