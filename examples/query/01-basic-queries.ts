/**
 * TONL Query API - Basic Queries Examples
 *
 * This example demonstrates fundamental query operations
 */

import { TONLDocument } from '../../dist/index.js';

console.log('=== TONL Query API - Basic Examples ===\n');

// Sample data
const data = {
  user: {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    profile: {
      age: 30,
      city: 'New York',
      preferences: {
        theme: 'dark',
        language: 'en'
      }
    }
  },
  posts: [
    { id: 101, title: 'First Post', likes: 42 },
    { id: 102, title: 'Second Post', likes: 15 },
    { id: 103, title: 'Third Post', likes: 67 }
  ]
};

const doc = TONLDocument.fromJSON(data);

// 1. Simple Property Access
console.log('1. Simple Property Access:');
console.log('   user.name:', doc.get('user.name'));
console.log('   user.email:', doc.get('user.email'));
console.log('');

// 2. Nested Property Access
console.log('2. Nested Property Access:');
console.log('   user.profile.age:', doc.get('user.profile.age'));
console.log('   user.profile.city:', doc.get('user.profile.city'));
console.log('   user.profile.preferences.theme:', doc.get('user.profile.preferences.theme'));
console.log('');

// 3. Array Indexing
console.log('3. Array Indexing:');
console.log('   posts[0]:', JSON.stringify(doc.get('posts[0]')));
console.log('   posts[1].title:', doc.get('posts[1].title'));
console.log('   posts[-1].title:', doc.get('posts[-1].title')); // Negative index
console.log('');

// 4. Path Existence Checking
console.log('4. Path Existence:');
console.log('   exists("user.name"):', doc.exists('user.name'));
console.log('   exists("user.phone"):', doc.exists('user.phone'));
console.log('   exists("posts[0]"):', doc.exists('posts[0]'));
console.log('   exists("posts[10]"):', doc.exists('posts[10]'));
console.log('');

// 5. Type Inspection
console.log('5. Type Inspection:');
console.log('   typeOf("user.name"):', doc.typeOf('user.name'));
console.log('   typeOf("user.profile.age"):', doc.typeOf('user.profile.age'));
console.log('   typeOf("posts"):', doc.typeOf('posts'));
console.log('   typeOf("user.profile"):', doc.typeOf('user.profile'));
console.log('');

// 6. Wildcards
console.log('6. Wildcard Queries:');
console.log('   posts[*].title:', doc.query('posts[*].title'));
console.log('   posts[*].likes:', doc.query('posts[*].likes'));
console.log('');

// 7. Recursive Descent
console.log('7. Recursive Descent (find all "id" fields):');
console.log('   $..id:', doc.query('$..id'));
console.log('');

console.log('✅ All basic queries completed successfully!');
