/**
 * Complete Application Example - Using All TONL Features Together
 *
 * This is a realistic example showing how to use TONL in a real application
 */

import { TONLDocument, FileEditor } from '../../dist/index.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

console.log('=== Complete Application Example ===\n');

// ============================================
// SCENARIO: User Management System
// ============================================

console.log('📋 Building a User Management System with TONL\n');

// 1. Initialize Application Data
console.log('1. Initialize Application:');
const app = TONLDocument.fromJSON({
  app: {
    name: 'User Management System',
    version: '1.0.0',
    settings: {
      maxUsers: 1000,
      allowRegistration: true,
      requireEmailVerification: true
    }
  },
  users: [],
  sessions: []
});

console.log('   App initialized:', app.get('app.name'));
console.log('');

// 2. Create Indices for Fast Lookups
console.log('2. Create Indices:');
app.createIndex({
  name: 'userById',
  fields: ['id'],
  unique: true,
  type: 'hash'
});

app.createIndex({
  name: 'userByEmail',
  fields: ['email'],
  unique: true,
  type: 'hash',
  caseInsensitive: true
});

console.log('   Created indices:', app.listIndices().join(', '));
console.log('');

// 3. Add Users
console.log('3. Register Users:');
const newUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin', verified: true, registeredAt: '2025-01-01' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'user', verified: true, registeredAt: '2025-01-02' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'moderator', verified: false, registeredAt: '2025-01-03' },
  { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'user', verified: true, registeredAt: '2025-01-04' }
];

for (const user of newUsers) {
  app.push('users', user);
  console.log(`   ✓ Registered: ${user.name} (${user.email})`);
}
console.log('');

// 4. Query Users
console.log('4. Query Users:');
const admins = app.query('users[?(@.role == "admin")]');
console.log('   Admins:', admins.map((u: any) => u.name));

const verified = app.query('users[?(@.verified)]');
console.log('   Verified users:', verified.length);

const unverified = app.query('users[?(!@.verified)]');
console.log('   Unverified users:', unverified.map((u: any) => u.name));
console.log('');

// 5. Use Index for Fast Lookup
console.log('5. Fast Lookups (O(1) with index):');
const userIdIndex = app.getIndex('userById');
const user2Paths = userIdIndex!.find(2);
console.log('   Find user ID=2:', user2Paths);
if (user2Paths.length > 0) {
  // In real app, would parse path and get user
  console.log('   User found via index (instant lookup!)');
}
console.log('');

// 6. Update User
console.log('6. Update User:');
const beforeUpdate = app.snapshot();
app.set('users[2].verified', true); // Verify Carol
console.log('   Verified Carol White');

const diff = app.diff(beforeUpdate);
console.log('   Changes made:', diff.summary.total);
console.log('   Modified fields:', diff.changes.map(c => c.path).join(', '));
console.log('');

// 7. Save to File (Atomic)
console.log('7. Save to File:');
const filename = 'user-management.tonl';
app.saveSync(filename);
console.log('   Saved to:', filename);

// Check file size
const tonlSize = (app.size() / 1024).toFixed(2);
const jsonSize = (JSON.stringify(app.toJSON()).length / 1024).toFixed(2);
console.log('   TONL size:', tonlSize, 'KB');
console.log('   JSON size:', jsonSize, 'KB');
console.log('   Savings:', ((1 - parseFloat(tonlSize) / parseFloat(jsonSize)) * 100).toFixed(1), '%');
console.log('');

// 8. File Editing with Backup
console.log('8. Safe File Editing:');
const editor = FileEditor.openSync(filename, { backup: true });
editor.data.app.version = '1.1.0';
editor.data.users.push({ id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'user', verified: false, registeredAt: '2025-01-05' });
console.log('   Modified in editor...');
editor.saveSync();
console.log('   ✓ Saved with backup (.bak file created)');
console.log('   Backup exists:', existsSync(filename + '.bak'));
console.log('');

// 9. Reload and Verify
console.log('9. Reload and Verify:');
const reloaded = TONLDocument.fromFileSync(filename);
console.log('   Reloaded version:', reloaded.get('app.version'));
console.log('   Total users:', reloaded.get('users').length);
console.log('   Last user:', reloaded.get('users[-1].name'));
console.log('');

// 10. Statistics
console.log('10. Document Statistics:');
const stats = reloaded.stats();
console.log('   Total nodes:', stats.nodeCount);
console.log('   Max depth:', stats.maxDepth);
console.log('   Arrays:', stats.arrayCount);
console.log('   Objects:', stats.objectCount);
console.log('   Primitives:', stats.primitiveCount);
console.log('');

// Cleanup
unlinkSync(filename);
if (existsSync(filename + '.bak')) {
  unlinkSync(filename + '.bak');
}

console.log('✅ Complete application workflow successful!');
console.log('');
console.log('This example demonstrated:');
console.log('  ✓ Document initialization');
console.log('  ✓ Index creation for O(1) lookups');
console.log('  ✓ CRUD operations (create, read, update, delete)');
console.log('  ✓ Advanced queries with filters');
console.log('  ✓ Change tracking and diff');
console.log('  ✓ Atomic file operations with backups');
console.log('  ✓ File size optimization (TONL vs JSON)');
console.log('  ✓ Safe file editing');
console.log('  ✓ Document statistics');
