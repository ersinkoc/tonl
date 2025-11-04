/**
 * TONL Indexing System - Basic Indexing Examples
 *
 * This example demonstrates hash and btree indexing for fast lookups
 */

import { TONLDocument } from '../../dist/index.js';

console.log('=== TONL Indexing System - Basic Examples ===\n');

// Generate sample data
const doc = TONLDocument.fromJSON({
  users: Array.from({ length: 100 }, (_, i) => ({
    id: 1000 + i,
    name: `User${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
    role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'moderator' : 'user',
    active: i % 2 === 0,
    score: Math.floor(Math.random() * 1000)
  }))
});

// ============================================
// HASH INDEX - O(1) Exact Match Lookups
// ============================================
console.log('1. Hash Index - O(1) Lookups:');

// Create unique ID index
const userIdIndex = doc.createIndex({
  name: 'userById',
  fields: ['id'],
  unique: true,
  type: 'hash'
});

console.log('   Index created:', userIdIndex.name);
console.log('   Index type:', userIdIndex.type);
console.log('   Index size:', userIdIndex.size());

// Fast lookups
const userId = 1050;
const paths = userIdIndex.find(userId);
console.log(`\n   Find user ID ${userId}:`, paths);

// Check existence
console.log('   Has user 1050:', userIdIndex.has(1050));
console.log('   Has user 9999:', userIdIndex.has(9999));

// Get statistics
const hashStats = userIdIndex.stats();
console.log('\n   Hash index stats:');
console.log('   - Entries:', hashStats.size);
console.log('   - Memory:', (hashStats.memoryUsage / 1024).toFixed(2), 'KB');
console.log('   - Collisions:', hashStats.collisions);
console.log('');

// ============================================
// BTREE INDEX - O(log n) with Range Queries
// ============================================
console.log('2. BTree Index - Range Queries:');

// Create age index for range queries
const ageIndex = doc.createIndex({
  name: 'byAge',
  fields: ['age'],
  type: 'btree'
});

console.log('   Index created:', ageIndex.name);
console.log('   Index type:', ageIndex.type);

// Range queries
console.log('\n   Ages 25-35:');
const range1 = ageIndex.range!(25, 35);
console.log('   - Found:', range1.length, 'users');

console.log('\n   Ages >= 40:');
const range2 = (ageIndex as any).greaterThan(40, true);
console.log('   - Found:', range2.length, 'users');

console.log('\n   Ages < 30:');
const range3 = (ageIndex as any).lessThan(30, false);
console.log('   - Found:', range3.length, 'users');

// Sorted iteration
console.log('\n   First 5 ages (sorted):');
let count = 0;
for (const age of ageIndex.keys()) {
  if (count++ < 5) console.log('   -', age);
}

const btreeStats = ageIndex.stats();
console.log('\n   BTree index stats:');
console.log('   - Entries:', btreeStats.size);
console.log('   - Depth:', btreeStats.depth);
console.log('   - Memory:', (btreeStats.memoryUsage / 1024).toFixed(2), 'KB');
console.log('');

// ============================================
// INDEX MANAGEMENT
// ============================================
console.log('3. Index Management:');

// List all indices
console.log('   All indices:', doc.listIndices());

// Get index stats for all
const allStats = doc.indexStats();
console.log('\n   Index statistics:');
for (const [name, stats] of Object.entries(allStats)) {
  console.log(`   - ${name}: ${stats.size} entries, ${stats.type} type`);
}

// Drop an index
const dropped = doc.dropIndex('byAge');
console.log('\n   Dropped "byAge" index:', dropped);
console.log('   Remaining indices:', doc.listIndices());
console.log('');

// ============================================
// PERFORMANCE COMPARISON
// ============================================
console.log('4. Performance - With vs Without Index:');

// Without index (linear search using query)
const start1 = Date.now();
const result1 = doc.query(`users[?(@.id == 1050)]`);
const time1 = Date.now() - start1;
console.log(`   Query without index: ${time1}ms`);

// With index (O(1) lookup)
const start2 = Date.now();
const paths2 = userIdIndex.find(1050);
const time2 = Date.now() - start2;
console.log(`   Lookup with index: ${time2}ms`);
console.log(`   Speedup: ${time1 > 0 ? (time1 / Math.max(time2, 0.001)).toFixed(2) : 'instant'}x faster`);
console.log('');

console.log('✅ All indexing operations completed successfully!');
