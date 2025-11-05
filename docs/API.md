# TONL API Documentation v1.0.2

**Version:** 1.0.0
**Status:** Stable & Production Ready
**Last Updated:** 2025-11-04

This document provides detailed API documentation for the TONL TypeScript library.

---

## Table of Contents

1. [TONLDocument API](#tonldocument-api) (Primary Interface)
2. [Core Functions](#core-functions) (Legacy/Lower-level)
3. [Utility Functions](#utility-functions)
4. [Streaming API](#streaming-api-v075)
5. [Schema API](#schema-api-v080)
6. [Query API](#query-api-v060)
7. [Modification API](#modification-api-v065)
8. [Navigation API](#navigation-api-v060)
9. [Indexing API](#indexing-api-v070)
10. [File Operations](#file-operations)
11. [Error Handling](#error-handling)
12. [Performance](#performance-considerations)

---

## TONLDocument API

**TONLDocument** is the primary class for working with TONL data. It provides a high-level interface for querying, modifying, and navigating TONL documents.

### Static Factory Methods

#### `TONLDocument.parse(tonlText, options?)`

Parse a TONL string into a document.

```typescript
static parse(tonlText: string, options?: DecodeOptions): TONLDocument
```

**Example:**
```typescript
const doc = TONLDocument.parse(`
#version 1.0
users[2]{id,name}:
  1, Alice
  2, Bob
`);
```

---

#### `TONLDocument.fromJSON(data)`

Create a document from JavaScript data.

```typescript
static fromJSON(data: any): TONLDocument
```

**Example:**
```typescript
const doc = TONLDocument.fromJSON({
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
});
```

---

#### `TONLDocument.fromFile(path)`

Load a TONL document from a file (async).

```typescript
static async fromFile(path: string): Promise<TONLDocument>
```

**Example:**
```typescript
const doc = await TONLDocument.fromFile('data.tonl');
```

---

#### `TONLDocument.fromFileSync(path)`

Load a TONL document from a file (sync).

```typescript
static fromFileSync(path: string): TONLDocument
```

**Example:**
```typescript
const doc = TONLDocument.fromFileSync('data.tonl');
```

---

### Query Methods

#### `get(pathExpression)`

Get a value at a specific path.

```typescript
get(pathExpression: string): any
```

**Examples:**
```typescript
doc.get('user.name')           // 'Alice'
doc.get('users[0]')            // { id: 1, name: 'Alice' }
doc.get('users[-1]')           // Last user
```

---

#### `query(pathExpression)`

Query the document with advanced expressions.

```typescript
query(pathExpression: string): any
```

**Examples:**
```typescript
doc.query('users[*].name')                    // ['Alice', 'Bob']
doc.query('users[?(@.role == "admin")]')      // Filter users
doc.query('$..email')                         // All emails recursively
```

---

#### `exists(pathExpression)`

Check if a path exists.

```typescript
exists(pathExpression: string): boolean
```

---

#### `typeOf(pathExpression)`

Get the type of value at a path.

```typescript
typeOf(pathExpression: string): string | undefined
```

Returns: `'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' | undefined`

---

### Modification Methods

#### `set(path, value)`

Set a value at a path (creates intermediate objects/arrays).

```typescript
set(path: string, value: any): TONLDocument
```

**Example:**
```typescript
doc
  .set('user.name', 'Alice')
  .set('user.age', 30)
  .set('user.verified', true);
```

---

#### `delete(path)`

Delete a value at a path.

```typescript
delete(path: string): TONLDocument
```

---

#### `push(path, ...items)`

Push items to an array.

```typescript
push(path: string, ...items: any[]): number
```

Returns: New array length

---

#### `pop(path)`

Remove and return the last item from an array.

```typescript
pop(path: string): any
```

---

#### `merge(path, object)`

Shallow merge an object at a path.

```typescript
merge(path: string, object: object): TONLDocument
```

---

### Navigation Methods

#### `entries()`

Iterate over [key, value] pairs at root level.

```typescript
*entries(): Generator<[string, any]>
```

**Example:**
```typescript
for (const [key, value] of doc.entries()) {
  console.log(`${key}: ${value}`);
}
```

---

#### `keys()` / `values()`

Iterate over keys or values at root level.

```typescript
*keys(): Generator<string>
*values(): Generator<any>
```

---

#### `deepEntries()` / `deepKeys()` / `deepValues()`

Recursively iterate over all [path, value] pairs, paths, or values.

```typescript
*deepEntries(): Generator<[string, any]>
*deepKeys(): Generator<string>
*deepValues(): Generator<any>
```

---

#### `walk(callback, options?)`

Walk the document tree with a callback.

```typescript
walk(callback: WalkCallback, options?: WalkOptions): void
```

**Example:**
```typescript
doc.walk((path, value, depth) => {
  console.log(`[Depth ${depth}] ${path}: ${value}`);
});
```

---

#### `find(predicate)` / `findAll(predicate)`

Find values matching a predicate.

```typescript
find(predicate: (value: any, path: string) => boolean): any
findAll(predicate: (value: any, path: string) => boolean): any[]
```

---

#### `some(predicate)` / `every(predicate)`

Check if any/all values match a predicate.

```typescript
some(predicate: (value: any, path: string) => boolean): boolean
every(predicate: (value: any, path: string) => boolean): boolean
```

---

#### `countNodes()`

Count total nodes in the document.

```typescript
countNodes(): number
```

---

### Change Tracking Methods

#### `snapshot()`

Create an independent copy of the document.

```typescript
snapshot(): TONLDocument
```

---

#### `diff(other)`

Compare with another document and generate a diff.

```typescript
diff(other: TONLDocument): DiffResult
```

**Returns:**
```typescript
interface DiffResult {
  changes: DiffEntry[];
  summary: {
    added: number;
    modified: number;
    deleted: number;
    total: number;
  };
}
```

---

#### `diffString(other)`

Generate a human-readable diff string.

```typescript
diffString(other: TONLDocument): string
```

---

### Indexing Methods

#### `createIndex(options)`

Create an index for fast lookups.

```typescript
createIndex(options: IndexOptions): void

interface IndexOptions {
  name: string;
  fields: string | string[];
  type?: 'hash' | 'btree' | 'compound';
  unique?: boolean;
}
```

**Example:**
```typescript
// Hash index (O(1) lookups)
doc.createIndex({
  name: 'userById',
  fields: 'id',
  type: 'hash',
  unique: true
});

// BTree index (O(log n) range queries)
doc.createIndex({
  name: 'userByAge',
  fields: 'age',
  type: 'btree'
});

// Compound index (multiple fields)
doc.createIndex({
  name: 'userByNameAndAge',
  fields: ['name', 'age'],
  type: 'compound'
});
```

---

#### `getIndex(name)`

Get an existing index.

```typescript
getIndex(name: string): IIndex | undefined
```

**Example:**
```typescript
const idx = doc.getIndex('userById');
const paths = idx.find(123);  // O(1) lookup
```

---

#### `listIndices()`

List all index names.

```typescript
listIndices(): string[]
```

---

#### `dropIndex(name)`

Remove an index.

```typescript
dropIndex(name: string): void
```

---

### Export Methods

#### `toJSON()`

Export to JavaScript object.

```typescript
toJSON(): any
```

---

#### `toTONL(options?)`

Export to TONL string.

```typescript
toTONL(options?: EncodeOptions): string
```

---

#### `save(path, options?)`

Save to file (async).

```typescript
async save(path: string, options?: EncodeOptions): Promise<void>
```

---

#### `saveSync(path, options?)`

Save to file (sync).

```typescript
saveSync(path: string, options?: EncodeOptions): void
```

---

### Metadata Methods

#### `stats()`

Get document statistics.

```typescript
stats(): DocumentStats

interface DocumentStats {
  sizeBytes: number;
  nodeCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
  primitiveCount: number;
}
```

---

## Core Functions

Lower-level encode/decode functions for direct use.

### `encodeTONL(input, options?)`

Encodes JavaScript/TypeScript data to TONL format string.

```typescript
function encodeTONL(input: any, options?: EncodeOptions): string

interface EncodeOptions {
  delimiter?: "," | "|" | "\t" | ";";    // Field delimiter (default: ",")
  includeTypes?: boolean;                // Add type hints (default: false)
  version?: string;                      // TONL version (default: "1.0")
  indent?: number;                       // Spaces per level (default: 2)
  singleLinePrimitiveLists?: boolean;    // Single line for primitives (default: true)
}
```

**Example:**
```typescript
import { encodeTONL } from 'tonl';

const data = {
  users: [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false }
  ]
};

const tonl = encodeTONL(data, {
  delimiter: "|",
  includeTypes: true,
  indent: 4
});
```

---

### `decodeTONL(text, options?)`

Decodes TONL format string back to JavaScript objects.

```typescript
function decodeTONL(text: string, options?: DecodeOptions): any

interface DecodeOptions {
  delimiter?: "," | "|" | "\t" | ";";    // Field delimiter (auto-detected)
  strict?: boolean;                      // Strict mode validation (default: false)
}
```

**Example:**
```typescript
import { decodeTONL } from 'tonl';

const tonlText = `#version 1.0
users[2]{id:u32,name:str,active:bool}:
  1, Alice, true
  2, Bob, false`;

const data = decodeTONL(tonlText);
// { users: [{ id: 1, name: "Alice", active: true }, ...] }
```

---

### `encodeSmart(input, options?)`

Automatically chooses optimal encoding settings based on data analysis.

```typescript
function encodeSmart(input: any, options?: EncodeOptions): string
```

**Smart Optimization:**
1. Delimiter selection to minimize quoting
2. Layout optimization for compactness
3. Type hint optimization

**Example:**
```typescript
import { encodeSmart } from 'tonl';

const data = {
  items: [
    { name: "Item A", category: "Tools, Hardware" },
    { name: "Item B", category: "Electronics" }
  ]
};

// Smart encoding will use "|" delimiter to avoid quoting commas
const optimized = encodeSmart(data);
```

---

## Utility Functions

### `parseTONLLine(line, delimiter)`

Parses a single TONL line into array of field values.

```typescript
function parseTONLLine(line: string, delimiter: TONLDelimiter): string[]
```

---

### `inferPrimitiveType(value)`

Infers the primitive type of a value for type hint generation.

```typescript
function inferPrimitiveType(value: unknown): TONLTypeHint

type TONLTypeHint = "u32" | "i32" | "f64" | "bool" | "null" | "str" | "obj" | "list"
```

**Examples:**
```typescript
inferPrimitiveType(42);        // "u32"
inferPrimitiveType(-10);       // "i32"
inferPrimitiveType(3.14);      // "f64"
inferPrimitiveType(true);      // "bool"
inferPrimitiveType(null);      // "null"
inferPrimitiveType("hello");   // "str"
inferPrimitiveType([1,2,3]);   // "list"
inferPrimitiveType({a: 1});    // "obj"
```

---

### `isUniformObjectArray(arr)`

Check if an array contains uniform objects.

```typescript
function isUniformObjectArray(arr: any[]): boolean
```

---

### `getUniformColumns(arr)`

Get stable column order for uniform object array.

```typescript
function getUniformColumns(arr: any[]): string[]
```

---

## Streaming API (v0.7.5+)

For handling large datasets efficiently.

### `streamQuery(filePath, pathExpression, options?)`

Stream query results from a file.

```typescript
async function* streamQuery(
  filePath: string,
  pathExpression: string,
  options?: StreamQueryOptions
): AsyncGenerator<any>

interface StreamQueryOptions {
  filter?: (value: any) => boolean;
  limit?: number;
  skip?: number;
  highWaterMark?: number;
}
```

**Example:**
```typescript
import { streamQuery } from 'tonl';

// Process 10GB file with constant memory
for await (const record of streamQuery('huge-data.tonl', 'records[*]', {
  filter: r => r.active,
  limit: 1000
})) {
  process(record);
}
```

---

### `streamAggregate(filePath, pathExpression, reducer, initialValue)`

Aggregate data from a stream.

```typescript
async function streamAggregate<T, R>(
  filePath: string,
  pathExpression: string,
  reducer: (accumulator: R, value: T) => R,
  initialValue: R
): Promise<R>
```

**Example:**
```typescript
const total = await streamAggregate(
  'sales.tonl',
  'sales[*].amount',
  (sum, amount) => sum + amount,
  0
);
```

---

### `StreamPipeline`

Chainable stream transformations.

```typescript
import { StreamPipeline } from 'tonl';

const pipeline = new StreamPipeline('data.tonl')
  .filter(item => item.active)
  .map(item => ({ ...item, processed: true }))
  .limit(100);

for await (const item of pipeline) {
  console.log(item);
}
```

---

## Schema API (v0.8.0+)

For data validation and type generation.

### `parseSchema(schemaText)`

Parse TONL Schema Language (TSL) into schema object.

```typescript
function parseSchema(schemaText: string): TONLSchema
```

**Example:**
```typescript
import { parseSchema } from 'tonl/schema';

const schemaText = `
@schema v1
User: obj
  id: u32 required
  name: str required min:2 max:100
  email: str required pattern:email
`;

const schema = parseSchema(schemaText);
```

---

### `validateTONL(data, schema, options?)`

Validate data against a schema.

```typescript
function validateTONL(
  data: any,
  schema: TONLSchema,
  options?: { strict?: boolean }
): ValidationResult

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

**Example:**
```typescript
import { parseSchema, validateTONL } from 'tonl/schema';

const schema = parseSchema(schemaText);
const data = { id: 123, name: 'Alice', email: 'alice@example.com' };

const result = validateTONL(data, schema);
if (!result.valid) {
  result.errors.forEach(err => console.error(err.message));
}
```

---

### `generateTypeScript(schema, options?)`

Generate TypeScript type definitions from schema.

```typescript
function generateTypeScript(
  schema: TONLSchema,
  options?: GenerateOptions
): string

interface GenerateOptions {
  exportAll?: boolean;
  readonly?: boolean;
  strict?: boolean;
}
```

---

## Query API (v0.6.0+)

See [QUERY_API.md](./QUERY_API.md) for detailed query syntax and examples.

**Path Syntax:**
- Property access: `user.name`
- Array indexing: `users[0]`, `users[-1]`
- Wildcards: `users[*].name`, `data.*`
- Recursive descent: `$..email`
- Array slicing: `users[0:5]`, `users[::2]`
- Filters: `users[?(@.age > 18)]`

**Operators:**
- Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=`
- Logical: `&&`, `||`, `!`
- String: `contains`, `startsWith`, `endsWith`, `matches`

---

## Modification API (v0.6.5+)

See [MODIFICATION_API.md](./MODIFICATION_API.md) for detailed modification examples.

**Operations:**
- `set(path, value)` - Create/update values
- `delete(path)` - Remove values
- `push(path, ...items)` - Add to arrays
- `pop(path)` - Remove from arrays
- `merge(path, object)` - Merge objects

**Change Tracking:**
- `snapshot()` - Create backups
- `diff(other)` - Generate diffs
- `diffString(other)` - Human-readable diffs

---

## Navigation API (v0.6.0+)

See [NAVIGATION_API.md](./NAVIGATION_API.md) for detailed navigation examples.

**Iterators:**
- `entries()`, `keys()`, `values()` - Root level
- `deepEntries()`, `deepKeys()`, `deepValues()` - Recursive
- `walk(callback, options?)` - Tree walking

**Search:**
- `find(predicate)` - First match
- `findAll(predicate)` - All matches
- `some(predicate)`, `every(predicate)` - Predicates

---

## Indexing API (v0.7.0+)

**Index Types:**
- **Hash Index**: O(1) exact matches
- **BTree Index**: O(log n) range queries
- **Compound Index**: Multi-field indexing

**Operations:**
- `createIndex(options)` - Create index
- `getIndex(name)` - Retrieve index
- `listIndices()` - List all indices
- `dropIndex(name)` - Remove index

---

## File Operations

### FileEditor

Atomic file editing with automatic backups.

```typescript
import { FileEditor } from 'tonl';

// Open file (creates backup)
const editor = await FileEditor.open('config.tonl', {
  backup: true,
  backupSuffix: '.bak'
});

// Modify data
editor.data.app.version = '2.0.0';

// Check if modified
if (editor.isModified()) {
  // Save atomically (temp file + rename)
  await editor.save();
}

// Restore from backup if needed
await editor.restoreBackup();
```

---

## Error Handling

### Error Classes

**TONLError** - Base error class
```typescript
class TONLError extends Error {
  line?: number;
  column?: number;
  source?: string;
}
```

**TONLParseError** - Syntax errors
```typescript
class TONLParseError extends TONLError {
  suggestion?: string;
}
```

**TONLValidationError** - Schema validation errors
```typescript
class TONLValidationError extends TONLError {
  field: string;
  expected?: string;
  actual?: string;
}
```

**TONLTypeError** - Type mismatch errors
```typescript
class TONLTypeError extends TONLError {
  expected: string;
  actual: string;
}
```

### Example

```typescript
try {
  const doc = TONLDocument.parse('invalid syntax');
} catch (error) {
  if (error instanceof TONLParseError) {
    console.error(`Parse error at line ${error.line}: ${error.message}`);
    if (error.suggestion) {
      console.log(`Suggestion: ${error.suggestion}`);
    }
  }
}
```

---

## Performance Considerations

### Encoding Performance
- Linear time O(n) where n = data size
- Memory efficient with array joins
- Type inference is cached

### Decoding Performance
- Single-pass parsing
- Efficient state machine
- Lazy type coercion

### Query Performance
- Simple path access: <0.1ms
- Wildcard queries (1000 nodes): <20ms
- Filter queries (1000 nodes): <50ms
- With indices: O(1) for hash, O(log n) for btree

### Optimization Tips
1. Use `encodeSmart()` for automatic optimization
2. Create indices for repeated lookups
3. Use streaming for large files (>100MB)
4. Enable strict mode only when needed
5. Batch modifications before saving

---

## TypeScript Integration

### Type Safety

```typescript
interface User {
  id: number;
  name: string;
  role: string;
}

const doc = TONLDocument.fromJSON({
  users: [] as User[]
});

// Type-safe queries (with assertion)
const users = doc.query('users[*]') as User[];
```

### Generic Helpers

```typescript
function loadTyped<T>(filePath: string): T {
  const doc = TONLDocument.fromFileSync(filePath);
  return doc.toJSON() as T;
}

// Usage
interface Config {
  database: {
    host: string;
    port: number;
  };
}

const config = loadTyped<Config>('config.tonl');
```

---

## Browser Compatibility

TONL works in all modern browsers and Node.js environments.

### ES Module

```html
<script type="module">
  import { TONLDocument, encodeTONL, decodeTONL } from 'https://cdn.skypack.dev/tonl';

  const doc = TONLDocument.fromJSON({ hello: 'world' });
  const tonl = doc.toTONL();
</script>
```

### CommonJS (Node.js)

```javascript
const { TONLDocument, encodeTONL, decodeTONL } = require('tonl');
```

### Bundle Size

- **Core**: 8.84 KB gzipped
- **Full**: ~25 KB gzipped (with all features)
- **Tree-shakeable**: Import only what you need

---

## Version

**Current version: 1.0.0**

- ✅ Production ready and stable
- ✅ Full feature set (query, modify, index, stream, schema)
- ✅ 100% test coverage
- ✅ Zero runtime dependencies
- ✅ TypeScript-first with full type safety
- ✅ Browser and Node.js support

---

## See Also

- [Getting Started Guide](./GETTING_STARTED.md)
- [CLI Documentation](./CLI.md)
- [Query API Reference](./QUERY_API.md)
- [Modification API Guide](./MODIFICATION_API.md)
- [Navigation API Reference](./NAVIGATION_API.md)
- [Format Specification](./SPECIFICATION.md)
- [Schema Specification](./SCHEMA_SPECIFICATION.md)
- [Use Cases](./USE_CASES.md)

---

**Happy coding with TONL! 🚀**
