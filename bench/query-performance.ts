/**
 * Query API Performance Benchmarks (T009)
 */

import { TONLDocument } from '../dist/index.js';

// Generate test data
const largeData = {
  users: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `User${i}`,
    age: 20 + (i % 50),
    role: i % 3 === 0 ? 'admin' : 'user',
    active: i % 2 === 0
  }))
};

const doc = TONLDocument.fromJSON(largeData);

console.log('🚀 TONL Query API Performance Benchmarks\n');

// Benchmark simple path
console.log('1. Simple Path Access (users[0].name)');
let start = Date.now();
for (let i = 0; i < 10000; i++) {
  doc.get('users[0].name');
}
let elapsed = Date.now() - start;
console.log(`   10,000 iterations: ${elapsed}ms (${(elapsed / 10000).toFixed(3)}ms per query)\n`);

// Benchmark wildcard
console.log('2. Wildcard Query (users[*].name)');
start = Date.now();
for (let i = 0; i < 100; i++) {
  doc.query('users[*].name');
}
elapsed = Date.now() - start;
console.log(`   100 iterations: ${elapsed}ms (${(elapsed / 100).toFixed(2)}ms per query)\n`);

// Benchmark filter
console.log('3. Filter Query (users[?(@.role == "admin")])');
start = Date.now();
for (let i = 0; i < 100; i++) {
  doc.query('users[?(@.role == "admin")]');
}
elapsed = Date.now() - start;
console.log(`   100 iterations: ${elapsed}ms (${(elapsed / 100).toFixed(2)}ms per query)\n`);

// Benchmark recursive descent
console.log('4. Recursive Descent ($..id)');
start = Date.now();
for (let i = 0; i < 100; i++) {
  doc.query('$..id');
}
elapsed = Date.now() - start;
console.log(`   100 iterations: ${elapsed}ms (${(elapsed / 100).toFixed(2)}ms per query)\n`);

// Tree walking
console.log('5. Tree Walking (all 10k+ nodes)');
start = Date.now();
doc.walk(() => {});
elapsed = Date.now() - start;
console.log(`   Full tree walk: ${elapsed}ms\n`);

// Statistics
const stats = doc.stats();
console.log('📊 Document Statistics:');
console.log(`   Nodes: ${stats.nodeCount}`);
console.log(`   Max Depth: ${stats.maxDepth}`);
console.log(`   Size: ${(stats.sizeBytes / 1024).toFixed(2)} KB\n`);

console.log('✅ All benchmarks completed!');
