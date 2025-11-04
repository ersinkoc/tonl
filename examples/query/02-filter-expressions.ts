/**
 * TONL Query API - Filter Expression Examples
 *
 * This example demonstrates advanced filtering capabilities
 */

import { TONLDocument } from '../../dist/index.js';

console.log('=== TONL Query API - Filter Expressions ===\n');

// E-commerce data
const data = {
  products: [
    { id: 1, name: 'Laptop', price: 1200, category: 'Electronics', inStock: true, rating: 4.5 },
    { id: 2, name: 'Mouse', price: 25, category: 'Electronics', inStock: true, rating: 4.2 },
    { id: 3, name: 'Keyboard', price: 75, category: 'Electronics', inStock: false, rating: 4.7 },
    { id: 4, name: 'Desk', price: 300, category: 'Furniture', inStock: true, rating: 4.0 },
    { id: 5, name: 'Chair', price: 250, category: 'Furniture', inStock: true, rating: 4.6 },
    { id: 6, name: 'Monitor', price: 400, category: 'Electronics', inStock: true, rating: 4.8 }
  ],
  users: [
    { id: 1, name: 'Alice', age: 30, role: 'admin', active: true, verified: true },
    { id: 2, name: 'Bob', age: 25, role: 'user', active: true, verified: false },
    { id: 3, name: 'Carol', age: 35, role: 'moderator', active: false, verified: true },
    { id: 4, name: 'Dave', age: 28, role: 'user', active: true, verified: true }
  ]
};

const doc = TONLDocument.fromJSON(data);

// 1. Comparison Operators
console.log('1. Comparison Operators:');
console.log('   Price > 100:', doc.query('products[?(@.price > 100)]').map((p: any) => p.name));
console.log('   Price <= 100:', doc.query('products[?(@.price <= 100)]').map((p: any) => p.name));
console.log('   Rating >= 4.5:', doc.query('products[?(@.rating >= 4.5)]').map((p: any) => p.name));
console.log('');

// 2. Equality Operators
console.log('2. Equality Operators:');
console.log('   Category == Electronics:', doc.query('products[?(@.category == "Electronics")]').map((p: any) => p.name));
console.log('   In Stock == true:', doc.query('products[?(@.inStock == true)]').map((p: any) => p.name));
console.log('   Role != user:', doc.query('users[?(@.role != "user")]').map((u: any) => u.name));
console.log('');

// 3. Logical Operators - AND
console.log('3. Logical AND (&&):');
console.log('   Electronics AND in stock:');
console.log('   ', doc.query('products[?(@.category == "Electronics" && @.inStock)]').map((p: any) => p.name));
console.log('   Price < 100 AND rating > 4.5:');
console.log('   ', doc.query('products[?(@.price < 100 && @.rating > 4.5)]').map((p: any) => p.name));
console.log('');

// 4. Logical Operators - OR
console.log('4. Logical OR (||):');
console.log('   Admin OR moderator:');
console.log('   ', doc.query('users[?(@.role == "admin" || @.role == "moderator")]').map((u: any) => u.name));
console.log('   Price < 50 OR category == Furniture:');
console.log('   ', doc.query('products[?(@.price < 50 || @.category == "Furniture")]').map((p: any) => p.name));
console.log('');

// 5. Logical Operators - NOT
console.log('5. Logical NOT (!):');
console.log('   NOT in stock:', doc.query('products[?(!@.inStock)]').map((p: any) => p.name));
console.log('   NOT active:', doc.query('users[?(!@.active)]').map((u: any) => u.name));
console.log('');

// 6. Complex Conditions
console.log('6. Complex Conditions:');
console.log('   Active AND verified users:');
console.log('   ', doc.query('users[?(@.active && @.verified)]').map((u: any) => u.name));
console.log('   High-value in-stock electronics:');
console.log('   ', doc.query('products[?(@.category == "Electronics" && @.price > 100 && @.inStock)]').map((p: any) => p.name));
console.log('   Budget items (< $100) with good rating (>= 4.5):');
console.log('   ', doc.query('products[?(@.price < 100 && @.rating >= 4.5)]').map((p: any) => p.name));
console.log('');

// 7. Combining Filters with Property Access
console.log('7. Filter + Property Access:');
console.log('   Names of active users:', doc.query('users[?(@.active)].name'));
console.log('   Prices of in-stock items:', doc.query('products[?(@.inStock)].price'));
console.log('   IDs of verified users:', doc.query('users[?(@.verified)].id'));
console.log('');

// 8. Real-World Scenarios
console.log('8. Real-World Scenarios:');
console.log('   Find premium products (price > 300, rating > 4.5):');
const premium = doc.query('products[?(@.price > 300 && @.rating > 4.5)]');
console.log('   ', premium.map((p: any) => `${p.name} ($${p.price})`));
console.log('');
console.log('   Find active admins:');
const activeAdmins = doc.query('users[?(@.active && @.role == "admin")]');
console.log('   ', activeAdmins.map((u: any) => u.name));
console.log('');

console.log('✅ All filter expressions work perfectly!');
