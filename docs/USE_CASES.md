# TONL Real-World Use Cases

This document showcases real-world scenarios where TONL excels.

---

## 🎯 Use Case 1: Configuration Management

**Problem:** Need to manage application configuration with versioning, easy querying, and atomic updates.

**Solution with TONL:**

```typescript
import { TONLDocument, FileEditor } from 'tonl';

// Load configuration
const config = await TONLDocument.fromFile('config.tonl');

// Query settings
const dbConfig = config.get('database');
const featureFlags = config.query('features[?(@.enabled)]');

// Update with safety
const backup = config.snapshot();

try {
  config.set('database.maxConnections', 200);
  config.set('features.newFeature', { enabled: true, beta: false });

  // Validate
  if (config.get('database.maxConnections') > 1000) {
    throw new Error('Too many connections');
  }

  // Save atomically
  await config.save('config.tonl');
} catch (error) {
  console.error('Update failed, using backup');
  // Restore from backup
}
```

**Benefits:**
- ✅ 32-45% smaller than JSON
- ✅ JSONPath queries for easy access
- ✅ Atomic saves with backups
- ✅ Change tracking for audit
- ✅ Type-safe with TypeScript

---

## 🎯 Use Case 2: User Analytics Dashboard

**Problem:** Need to analyze user data, filter by criteria, and generate reports.

**Solution with TONL:**

```typescript
// Load user data
const data = await TONLDocument.fromFile('users.tonl');

// Create indices for fast lookups
data.createIndex({ name: 'byCountry', fields: ['country'], type: 'hash' });
data.createIndex({ name: 'byAge', fields: ['age'], type: 'btree' });

// Analytics queries
const activeUsers = data.query('users[?(@.active)]').length;
const premiumUsers = data.query('users[?(@.subscription == "premium")]').length;
const avgAge = data.query('users[*].age').reduce((sum, age) => sum + age, 0) / activeUsers;

// Range queries with index
const youngAdults = data.getIndex('byAge')!.range(18, 30);
const seniors = data.getIndex('byAge')!.greaterThan(65);

// Geographic distribution
const byCountry = data.getIndex('byCountry')!;
for (const country of byCountry.keys()) {
  const count = byCountry.find(country).length;
  console.log(`${country}: ${count} users`);
}

// Generate report
const report = {
  totalUsers: data.query('users[*]').length,
  activeUsers,
  premiumUsers,
  averageAge: avgAge,
  demographics: {
    youngAdults: youngAdults.length,
    seniors: seniors.length
  }
};
```

**Benefits:**
- ✅ Fast queries with filters
- ✅ O(1) and O(log n) lookups via indices
- ✅ Flexible analytics
- ✅ Easy aggregations

---

## 🎯 Use Case 3: Data Migration

**Problem:** Need to migrate data from old format to new format, track changes, validate.

**Solution with TONL:**

```typescript
// Load old data
const oldData = await TONLDocument.fromFile('old-format.tonl');

// Create new structure
const newData = TONLDocument.fromJSON({
  version: '2.0',
  migrated: new Date().toISOString(),
  users: []
});

// Migrate users
const users = oldData.query('users[*]');
for (const user of users) {
  // Transform structure
  newData.push('users', {
    id: user.userId,           // Rename field
    profile: {
      name: user.fullName,     // Restructure
      email: user.email,
      joined: user.createdAt
    },
    settings: user.prefs || {} // Migrate settings
  });
}

// Track migration
const diff = oldData.diff(newData);
console.log('Migration changes:', diff.summary);
console.log('Migrated users:', newData.query('users[*]').length);

// Save new format
await newData.save('new-format.tonl');

// Keep audit trail
writeFileSync('migration-log.json', JSON.stringify({
  date: new Date(),
  oldVersion: oldData.get('version'),
  newVersion: newData.get('version'),
  changes: diff.summary,
  details: diff.changes
}, null, 2));
```

**Benefits:**
- ✅ Easy data transformation
- ✅ Change tracking for audit
- ✅ Validation during migration
- ✅ Rollback capability with snapshots

---

## 🎯 Use Case 4: Log Processing & Analysis

**Problem:** Need to process multi-GB log files without loading entire file into memory.

**Solution with TONL:**

```typescript
import { streamQuery, streamAggregate, StreamPipeline } from 'tonl';

// Process 50GB log file with <100MB memory
const errorCount = await streamAggregate(
  'application.log.tonl',
  'logs[*]',
  (count, log) => log.level === 'ERROR' ? count + 1 : count,
  0
);

// Find critical errors
const criticalErrors = [];
for await (const log of streamQuery('application.log.tonl', 'logs[*]', {
  filter: l => l.level === 'ERROR' && l.critical,
  limit: 100
})) {
  criticalErrors.push(log);
}

// Aggregate by status code
const statusCodes = await streamAggregate(
  'access.log.tonl',
  'requests[*]',
  (codes: any, req) => {
    codes[req.statusCode] = (codes[req.statusCode] || 0) + 1;
    return codes;
  },
  {}
);

// Pipeline for complex processing
const pipeline = new StreamPipeline()
  .filter(log => log.timestamp > Date.now() - 86400000) // Last 24h
  .filter(log => log.level === 'ERROR')
  .map(log => ({
    time: log.timestamp,
    message: log.message,
    stack: log.stack
  }));

for await (const error of pipeline.execute('logs.tonl', 'logs[*]')) {
  sendAlert(error);
}
```

**Benefits:**
- ✅ <100MB memory for any file size
- ✅ Real-time processing
- ✅ Complex filtering and aggregation
- ✅ Handles production log volumes

---

## 🎯 Use Case 5: E-Commerce Product Catalog

**Problem:** Need fast product searches, filtering, and inventory management.

**Solution with TONL:**

```typescript
// Load product catalog
const catalog = await TONLDocument.fromFile('products.tonl');

// Create indices for common searches
catalog.createIndex({ name: 'bySKU', fields: ['sku'], unique: true });
catalog.createIndex({ name: 'byPrice', fields: ['price'], type: 'btree' });
catalog.createIndex({ name: 'byCategory', fields: ['category'] });

// Fast SKU lookup (O(1))
const product = catalog.getIndex('bySKU')!.find('SKU-12345');

// Find products in price range (O(log n))
const affordableProducts = catalog.getIndex('byPrice')!.range(10, 100);

// Complex product search
const results = catalog.query(`
  products[?(
    @.inStock &&
    @.price < 100 &&
    @.rating >= 4.0 &&
    (@.category == "Electronics" || @.category == "Home")
  )]
`);

// Update inventory
catalog.set('products[?(@.sku == "SKU-12345")].stock', 50);

// Track price changes
const yesterday = catalog.snapshot();
catalog.set('products[10].price', 79.99);
const priceChanges = catalog.diff(yesterday);

// Save with backup
const editor = await FileEditor.open('products.tonl', { backup: true });
editor.data.products = catalog.get('products');
editor.data.lastUpdated = new Date().toISOString();
await editor.save();
```

**Benefits:**
- ✅ O(1) SKU lookups via index
- ✅ Range queries for price filtering
- ✅ Complex search with multiple criteria
- ✅ Inventory tracking
- ✅ Audit trail with diff

---

## 🎯 Use Case 6: API Response Caching

**Problem:** Need to cache API responses efficiently and query them quickly.

**Solution with TONL:**

```typescript
class APICache {
  private cache: TONLDocument;

  constructor() {
    this.cache = TONLDocument.fromJSON({
      metadata: { created: new Date() },
      responses: []
    });

    // Index by endpoint for fast lookups
    this.cache.createIndex({
      name: 'byEndpoint',
      fields: ['endpoint'],
      type: 'hash'
    });
  }

  async set(endpoint: string, data: any, ttl: number = 3600) {
    const entry = {
      endpoint,
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.push('responses', entry);
  }

  get(endpoint: string): any | null {
    // Use index for O(1) lookup
    const idx = this.cache.getIndex('byEndpoint')!;
    const paths = idx.find(endpoint);

    if (paths.length === 0) return null;

    // Get most recent response
    const responses = this.cache.query(`responses[?(@.endpoint == "${endpoint}")]`);
    const latest = responses[responses.length - 1];

    // Check TTL
    if (Date.now() - latest.timestamp > latest.ttl * 1000) {
      return null; // Expired
    }

    return latest.data;
  }

  clearExpired() {
    const now = Date.now();
    const responses = this.cache.get('responses');

    const valid = responses.filter((r: any) => {
      return now - r.timestamp <= r.ttl * 1000;
    });

    this.cache.set('responses', valid);
  }
}

// Usage
const cache = new APICache();

await cache.set('/api/users', { users: [...] }, 60);
await cache.set('/api/products', { products: [...] }, 300);

const users = cache.get('/api/users');
if (users) {
  console.log('Cache hit!', users);
} else {
  console.log('Cache miss, fetching...');
}
```

**Benefits:**
- ✅ Fast endpoint lookups
- ✅ TTL support
- ✅ Compact storage
- ✅ Easy cleanup

---

## 🎯 Use Case 7: Testing & Fixtures

**Problem:** Need to manage test fixtures with easy querying and modification.

**Solution with TONL:**

```typescript
// Test fixture management
class TestFixtures {
  private fixtures: TONLDocument;

  constructor() {
    this.fixtures = TONLDocument.fromJSON({
      users: [
        { id: 1, name: 'Test User 1', role: 'admin', verified: true },
        { id: 2, name: 'Test User 2', role: 'user', verified: false }
      ],
      products: [
        { id: 101, name: 'Test Product', price: 99.99, stock: 10 }
      ]
    });
  }

  getUser(criteria: string) {
    return this.fixtures.query(`users[?${criteria}]`);
  }

  getAdminUser() {
    return this.fixtures.query('users[?(@.role == "admin")]')[0];
  }

  getUnverifiedUser() {
    return this.fixtures.query('users[?(!@.verified)]')[0];
  }

  reset() {
    // Reset to initial state
    this.fixtures = TONLDocument.fromJSON({
      users: [...],
      products: [...]
    });
  }
}

// In tests
describe('User API', () => {
  const fixtures = new TestFixtures();

  test('should create user', () => {
    const admin = fixtures.getAdminUser();
    const result = createUser(admin);
    expect(result.success).toBe(true);
  });

  test('should reject unverified user', () => {
    const unverified = fixtures.getUnverifiedUser();
    const result = performAction(unverified);
    expect(result.error).toBe('User not verified');
  });
});
```

**Benefits:**
- ✅ Easy fixture management
- ✅ Flexible queries
- ✅ No database needed
- ✅ Fast test execution

---

## 🎯 Use Case 8: LLM Prompt Optimization

**Problem:** Need to send data to LLMs but minimize token costs.

**Solution with TONL:**

```typescript
import { encodeTONL } from 'tonl';

// Large dataset
const userData = {
  users: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    preferences: { theme: 'dark', lang: 'en' }
  }))
};

// Encode to TONL (32-45% smaller)
const tonlFormat = encodeTONL(userData, { smart: true });
const jsonFormat = JSON.stringify(userData);

console.log('JSON size:', jsonFormat.length, 'characters');
console.log('TONL size:', tonlFormat.length, 'characters');
console.log('Token savings:', ((1 - tonlFormat.length / jsonFormat.length) * 100).toFixed(1), '%');

// Send to LLM
const response = await callLLM({
  prompt: `Analyze this user data:\n${tonlFormat}\n\nFind patterns...`
});

// Parse LLM response (if it returns TONL)
const result = TONLDocument.parse(response);
```

**Benefits:**
- ✅ 32-45% token reduction
- ✅ Readable format
- ✅ LLMs can understand it
- ✅ Significant cost savings

---

## 🎯 Use Case 9: Data Pipeline Processing

**Problem:** ETL pipeline needs to transform and validate data efficiently.

**Solution with TONL:**

```typescript
import { streamQuery, StreamPipeline } from 'tonl';

// Extract: Stream from source
// Transform: Filter and map
// Load: Save to destination

const pipeline = new StreamPipeline()
  // Filter valid records
  .filter(record => record.validated && !record.deleted)

  // Transform structure
  .map(record => ({
    id: record.id,
    timestamp: new Date(record.created_at).toISOString(),
    user: {
      id: record.user_id,
      email: record.email
    },
    metrics: {
      value: record.amount,
      currency: record.currency || 'USD'
    }
  }))

  // Additional filtering
  .filter(transformed => transformed.metrics.value > 0);

// Process pipeline
const results = [];
for await (const record of pipeline.execute('raw-data.tonl', 'records[*]')) {
  results.push(record);

  // Batch save every 1000 records
  if (results.length >= 1000) {
    await saveToDatabase(results);
    results.length = 0;
  }
}

// Save remaining
if (results.length > 0) {
  await saveToDatabase(results);
}
```

**Benefits:**
- ✅ Memory-efficient streaming
- ✅ Chainable transformations
- ✅ Complex filtering
- ✅ Handles huge datasets

---

## 🎯 Use Case 10: Version Control for Data

**Problem:** Need to track data changes over time like git for code.

**Solution with TONL:**

```typescript
class DataVersionControl {
  private versions: Array<{ timestamp: Date; snapshot: TONLDocument; diff: any }> = [];
  private current: TONLDocument;

  constructor(initial: any) {
    this.current = TONLDocument.fromJSON(initial);
    this.commit('Initial commit');
  }

  commit(message: string) {
    const snapshot = this.current.snapshot();
    const diff = this.versions.length > 0
      ? this.current.diff(this.versions[this.versions.length - 1].snapshot)
      : null;

    this.versions.push({
      timestamp: new Date(),
      snapshot,
      diff
    });

    console.log(`Committed: ${message}`);
    if (diff) {
      console.log(`  Changes: ${diff.summary.total}`);
    }
  }

  modify(updateFn: (doc: TONLDocument) => void) {
    updateFn(this.current);
  }

  showHistory() {
    this.versions.forEach((v, i) => {
      console.log(`Version ${i}: ${v.timestamp.toISOString()}`);
      if (v.diff) {
        console.log(`  +${v.diff.summary.added} -${v.diff.summary.deleted} ~${v.diff.summary.modified}`);
      }
    });
  }

  revertTo(version: number) {
    if (version < 0 || version >= this.versions.length) {
      throw new Error('Invalid version');
    }
    this.current = this.versions[version].snapshot.snapshot();
    console.log(`Reverted to version ${version}`);
  }
}

// Usage
const vcs = new DataVersionControl({ users: [] });

vcs.modify(doc => doc.push('users', { name: 'Alice' }));
vcs.commit('Added Alice');

vcs.modify(doc => doc.push('users', { name: 'Bob' }));
vcs.commit('Added Bob');

vcs.modify(doc => doc.set('users[0].role', 'admin'));
vcs.commit('Made Alice admin');

vcs.showHistory();
// Version 0: ...
//   Changes: 0
// Version 1: ...
//   +1 -0 ~0
// Version 2: ...
//   +1 -0 ~0
// Version 3: ...
//   +0 -0 ~1

vcs.revertTo(1); // Go back to version 1
```

**Benefits:**
- ✅ Complete version history
- ✅ Detailed change tracking
- ✅ Revert capability
- ✅ Audit trail

---

## 💡 More Ideas

### Content Management System
- Store articles, pages, media metadata
- Query by tags, author, date
- Track editorial changes
- Version control for content

### IoT Data Collection
- Stream sensor data
- Aggregate by time periods
- Index by device ID
- Efficient storage

### Game State Management
- Save game state in TONL
- Query player inventory
- Track achievements
- Replay system with snapshots

### Financial Data
- Transaction records
- Portfolio management
- Price history with indices
- Audit trail for compliance

---

## 🔗 Learn More

- [Getting Started Guide](./GETTING_STARTED.md)
- [Examples Directory](../examples/)
- [API Documentation](./QUERY_API.md)

---

**Build amazing things with TONL! 🚀**
