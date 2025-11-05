# Getting Started with TONL v1.0.2

Welcome to TONL! This guide will help you get started with all the powerful features of TONL.

---

## 📦 Installation

```bash
npm install tonl
```

---

## 🚀 Quick Start (30 seconds)

```typescript
import { TONLDocument } from 'tonl';

// Create or load a document
const doc = TONLDocument.fromJSON({
  users: [
    { name: 'Alice', age: 30, role: 'admin' },
    { name: 'Bob', age: 25, role: 'user' }
  ]
});

// Query the data
const admins = doc.query('users[?(@.role == "admin")]');
console.log(admins); // [{ name: 'Alice', age: 30, role: 'admin' }]

// Modify the data
doc.set('users[0].age', 31);

// Save to file
await doc.save('data.tonl');
```

**That's it! You're using TONL! 🎉**

---

## 📚 Core Concepts

### 1. TONLDocument - Your Main Interface

TONLDocument is the primary class for working with TONL data.

```typescript
import { TONLDocument } from 'tonl';

// Create from JSON
const doc = TONLDocument.fromJSON({ name: 'Alice' });

// Parse from TONL string
const doc2 = TONLDocument.parse('name, Alice');

// Load from file
const doc3 = await TONLDocument.fromFile('data.tonl');
```

### 2. Querying - JSONPath-Like Syntax

TONL uses an intuitive query syntax similar to JSONPath:

```typescript
// Simple paths
doc.get('user.name')               // Get a single value
doc.get('users[0]')                // Array index
doc.get('users[-1]')               // Negative index (last item)

// Advanced queries
doc.query('users[*].name')         // Wildcard - all names
doc.query('$..email')              // Recursive - all emails at any depth
doc.query('users[0:5]')            // Slice - first 5 users
doc.query('users[?(@.age > 18)]')  // Filter - users over 18
```

### 3. Modification - Full CRUD

```typescript
// Create/Update
doc.set('user.name', 'Alice')      // Creates path if needed
doc.set('users[0].active', true)   // Update array element

// Delete
doc.delete('user.temp')            // Remove property
doc.delete('users[0]')             // Remove array element

// Array operations
doc.push('users', { name: 'New User' })
doc.pop('users')
doc.merge('user', { age: 31, email: 'alice@example.com' })
```

### 4. Indexing - Fast Lookups

```typescript
// Create index for O(1) lookups
doc.createIndex({
  name: 'userById',
  fields: ['id'],
  unique: true
});

// Use index
const idx = doc.getIndex('userById');
const paths = idx.find(12345);     // O(1) - instant!
```

### 5. Change Tracking

```typescript
// Take snapshot
const before = doc.snapshot();

// Make changes
doc.set('version', '2.0.0');
doc.set('features.newFeature', true);

// Compare
const diff = doc.diff(before);
console.log(diff.summary);         // { added: 1, modified: 1, deleted: 0 }
console.log(doc.diffString(before)); // Human-readable diff
```

---

## 🎯 Common Use Cases

### Use Case 1: Configuration Management

```typescript
// Load configuration
const config = await TONLDocument.fromFile('config.tonl');

// Read settings
const dbHost = config.get('database.host');
const apiKey = config.get('api.key');

// Update settings
config.set('database.maxConnections', 100);
config.set('features.newFeature', true);

// Save atomically
await config.save('config.tonl');
```

### Use Case 2: Data Analysis

```typescript
// Load data
const data = await TONLDocument.fromFile('sales.tonl');

// Create index for fast lookups
data.createIndex({
  name: 'salesByRegion',
  fields: ['region'],
  type: 'hash'
});

// Query specific data
const highValueSales = data.query('sales[?(@.amount > 1000)]');
const activeSales = data.query('sales[?(@.status == "completed")]');

// Get all customer emails
const emails = data.query('$..customer.email');

// Calculate total
const sales = data.query('sales[*].amount');
const total = sales.reduce((sum: number, amt: number) => sum + amt, 0);
console.log('Total sales:', total);
```

### Use Case 3: User Management

```typescript
const users = TONLDocument.fromJSON({ users: [] });

// Add users
users.push('users',
  { id: 1, name: 'Alice', role: 'admin', active: true },
  { id: 2, name: 'Bob', role: 'user', active: true }
);

// Find active admins
const activeAdmins = users.query('users[?(@.active && @.role == "admin")]');

// Deactivate user
users.set('users[?(@.name == "Bob")].active', false); // Note: Use index for better performance

// Track changes
const snapshot = users.snapshot();
// ... make changes ...
const changes = users.diff(snapshot);
console.log('Audit log:', changes.changes);
```

---

## 🔥 Advanced Features

### Streaming for Large Files

```typescript
import { streamQuery, streamAggregate } from 'tonl';

// Process 10GB file with constant memory
for await (const record of streamQuery('huge-data.tonl', 'records[*]', {
  filter: r => r.active,
  limit: 1000
})) {
  process(record);
}

// Aggregate data
const total = await streamAggregate(
  'sales.tonl',
  'sales[*].amount',
  (sum, amount) => sum + amount,
  0
);
```

### Interactive REPL

```bash
$ tonl
TONL REPL v0.8.0

tonl> .load data.tonl
✓ Loaded: data.tonl

tonl> users[?(@.active)].name
["Alice", "Bob"]

tonl> .doc
Nodes: 150, Size: 2.45 KB
```

### Safe File Operations

```typescript
import { FileEditor } from 'tonl';

// Open with automatic backup
const editor = await FileEditor.open('important.tonl', { backup: true });

// Make changes
editor.data.settings.updated = new Date().toISOString();

// Save atomically (temp file + rename)
await editor.save();

// Restore from backup if needed
await editor.restoreBackup();
```

---

## 📖 Next Steps

1. **Read the API Documentation**
   - [Query API Guide](./QUERY_API.md)
   - [Navigation API Guide](./NAVIGATION_API.md)
   - [Modification API Guide](./docs/MODIFICATION_API.md)

2. **Explore Examples**
   - Check the `examples/` directory
   - Run examples: `node examples/query/01-basic-queries.ts`

3. **Try the CLI**
   ```bash
   tonl encode data.json --out data.tonl
   tonl query data.tonl "users[?(@.active)]"
   tonl
   ```

4. **Join the Community**
   - GitHub: https://github.com/ersinkoc/tonl
   - Issues: https://github.com/ersinkoc/tonl/issues

---

## ❓ FAQ

### Q: How is TONL different from JSON?
A: TONL is more compact (32-45% smaller) and provides a rich query/modification API on top of serialization.

### Q: Can I use TONL with existing JSON data?
A: Yes! `TONLDocument.fromJSON(yourData)` - works with any JSON.

### Q: Is it production-ready?
A: Yes! v1.0.2 is stable with 100% test pass rate.

### Q: How fast is it?
A: Very fast! Simple queries: 0.005ms, Filters: 0.03ms, 10-1600x faster than targets.

### Q: Does it work with large files?
A: Yes! Streaming API handles multi-GB files with <100MB memory.

---

## 🎯 Best Practices

1. **Use Indices for Repeated Lookups**
   ```typescript
   doc.createIndex({ name: 'byId', fields: ['id'], unique: true });
   const idx = doc.getIndex('byId');
   idx.find(123); // Much faster than querying!
   ```

2. **Track Changes in Production**
   ```typescript
   const backup = doc.snapshot();
   try {
     // ... make changes ...
   } catch (error) {
     // Can compare with backup for rollback
     const changes = doc.diff(backup);
     console.error('Failed changes:', changes);
   }
   ```

3. **Use Atomic Saves**
   ```typescript
   const editor = await FileEditor.open('data.tonl', { backup: true });
   // ... modify editor.data ...
   await editor.save(); // Atomic write with backup
   ```

4. **Stream Large Files**
   ```typescript
   // Don't load entire file
   for await (const item of streamQuery('huge.tonl', '$[*]')) {
     // Process one at a time - constant memory!
   }
   ```

---

**Ready to build amazing things with TONL! 🚀**

For more help: https://github.com/ersinkoc/tonl/tree/main/docs
