# Format Overview

TONL syntax reference with concrete examples. See [Getting Started](./GETTING_STARTED.md) for introduction.

## Data Model

TONL models data the same way as JSON:

* **Primitives**: strings, numbers, booleans, and `null`
* **Objects**: mappings from string keys to values
* **Arrays**: ordered sequences of values

### Root Forms

A TONL document can represent different root forms:

* **Root object** (most common): Fields appear at depth 0 with no parent key
* **Root array**: Begins with `key[N]{fields}:` at depth 0
* **Root primitive**: A single primitive value (string, number, boolean, or null)

Most examples in these docs use root objects, but the format supports all three forms equally.

## Document Headers

TONL documents can include optional metadata headers at the top.

### Version Header

```tonl
#version 1.0
```

Specifies the TONL format version. Defaults to `1.0` if omitted.

### Delimiter Header

```tonl
#delimiter "|"
```

Declares the column separator for tabular data. Supported delimiters:

| Delimiter | Declaration | Use Case |
|-----------|-------------|----------|
| Comma | (default, no header needed) | Most compact, standard data |
| Pipe | `#delimiter "\|"` | Data containing commas |
| Tab | `#delimiter "\t"` | Visual alignment, spreadsheet-like |
| Semicolon | `#delimiter ";"` | CSV-style data with embedded commas |

### Complete Header Example

```tonl
#version 1.0
#delimiter "|"

users[2]{id|name|role}:
  1|Alice|admin
  2|Bob|user
```

## Objects

### Simple Objects

Objects with primitive values use `key: value` syntax, with one field per line:

```tonl
id: 123
name: Ada
active: true
```

Indentation replaces braces. One space follows the colon.

### Objects with Type Hints

Type hints are optional and appear in the header:

```tonl
user{id:u32,name:str,active:bool}:
  id: 123
  name: Ada
  active: true
```

The header `user{id:u32,name:str,active:bool}:` declares:

* **Object name**: `user`
* **Field names with types**: `id:u32`, `name:str`, `active:bool`

### Nested Objects

Nested objects add one indentation level (default: 2 spaces):

```tonl
user{id:u32,name:str,contact:obj}:
  id: 1
  name: Alice
  contact{email:str,phone:str}:
    email: alice@example.com
    phone: +123456789
```

When a key ends with `:` and has no value on the same line, it opens a nested object. All lines at the next indentation level belong to that object.

### Empty Objects

An empty object at the root yields an empty document (no lines). A nested empty object is `key:` alone, with no children:

```tonl
user{id:u32,metadata:obj}:
  id: 1
  metadata:
```

## Arrays

TONL detects array structure and chooses the most efficient representation. Arrays declare their length in brackets: `[N]`.

### Primitive Arrays (Inline)

Arrays of primitives (strings, numbers, booleans, null) are rendered inline:

```tonl
tags[3]: admin, ops, dev
scores[4]: 95, 87, 92, 100
flags[3]: true, false, true
```

The delimiter (comma by default) separates values. Strings containing the active delimiter must be quoted.

### Primitive Arrays (Multi-line)

For clarity or long values, primitive arrays can span multiple lines:

```tonl
tags[3]:
  admin
  ops
  dev
```

### Arrays of Objects (Tabular)

When all objects in an array share the same set of primitive-valued keys, TONL uses tabular format:

::: code-group

```tonl [Basic Tabular]
users[3]{id,name,role}:
  1, Alice, admin
  2, Bob, user
  3, Carol, editor
```

```tonl [With Type Hints]
users[3]{id:u32,name:str,role:str}:
  1, Alice, admin
  2, Bob, user
  3, Carol, editor
```

```tonl [With Quoted Values]
users[2]{id:u32,name:str,role:str}:
  1, Alice Admin, admin
  2, "Bob, Jr.", user
```

:::

The header `users[3]{id:u32,name:str,role:str}:` declares:

* **Array name**: `users`
* **Array length**: `[3]` means 3 rows
* **Field names**: `{id,name,role}` or `{id:u32,name:str,role:str}` with types
* **Active delimiter**: comma (default)

Each row contains values in the same order as the field list. Values are encoded as primitives and separated by the delimiter.

> **Note**: Tabular format requires identical field sets across all objects (same keys) and primitive values only (no nested arrays/objects).

### Mixed and Non-Uniform Arrays

Arrays that don't meet the tabular requirements use indexed format:

```tonl
items[3]:
  [0]{id:u32,title:str}:
    id: 1
    title: "First item"
  [1]{id:u32,title:str}:
    id: 2
    title: "Second item"
  [2]: simple value
```

Each element uses `[index]` prefix with its type declaration.

### Nested Objects in Tabular Arrays

When tabular array objects contain nested structures:

```tonl
project{id:u32,name:str,tasks:list}:
  id: 101
  name: Alpha
  tasks[2]{id:u32,title:str,assignee:obj,status:str}:
    id: 201
    title: "Design API"
    assignee{id:u32,name:str}:
      id: 2
      name: Bob
    status: done
    id: 202
    title: "Write Tests"
    assignee{id:u32,name:str}:
      id: 1
      name: Alice
    status: pending
```

### Empty Arrays

Empty arrays have a simple representation:

```tonl
items[0]:
```

The header declares length zero, with no elements following.

## Array Headers

### Header Syntax

Array headers follow this pattern:

```
key[N]{field1[:type],field2[:type],...}:
```

Where:

* **N** is the non-negative integer length
* **field:type** (optional) declares column name and type hint
* Delimiter is set via `#delimiter` header or defaults to comma

### Length Declaration

The array length `[N]` serves multiple purposes:

* **Validation**: In strict mode, actual count must match declared length
* **LLM Guidance**: Helps language models understand expected structure
* **Truncation Detection**: Identifies incomplete data

> **Tip**: The array length helps LLMs validate structure. If you ask a model to generate TONL output, explicit lengths let you detect truncation or malformed data.

### Delimiter Options

TONL supports four delimiters: comma (default), pipe, tab, and semicolon:

::: code-group

```tonl [Comma (default)]
items[2]{sku,name,qty,price}:
  A1, Widget, 2, 9.99
  B2, Gadget, 1, 14.5
```

```tonl [Pipe]
#delimiter "|"

items[2]{sku|name|qty|price}:
  A1|Widget|2|9.99
  B2|Gadget|1|14.5
```

```tonl [Tab]
#delimiter "\t"

items[2]{sku	name	qty	price}:
  A1	Widget	2	9.99
  B2	Gadget	1	14.5
```

```tonl [Semicolon]
#delimiter ";"

items[2]{sku;name;qty;price}:
  A1;Widget;2;9.99
  B2;Gadget;1;14.5
```

:::

> **Tip**: Tab delimiters often tokenize more efficiently than commas, especially for data with few quoted strings. Use `encodeTONL(data, { delimiter: '\t' })` for additional token savings.

## Type Hints

Type hints are optional annotations that provide schema information in the header.

### Syntax

```tonl
key{field:type,field:type,...}:
```

### Available Types

| Type | Description | JSON Equivalent | Example |
|------|-------------|-----------------|---------|
| `str` | String | string | `name:str` |
| `u32` | Unsigned 32-bit integer | number ≥ 0 | `id:u32` |
| `i32` | Signed 32-bit integer | number | `count:i32` |
| `f64` | 64-bit float | number | `price:f64` |
| `bool` | Boolean | true/false | `active:bool` |
| `null` | Null value | null | `deleted:null` |
| `obj` | Object | object | `contact:obj` |
| `list` | Array | array | `tags:list` |

### Type Inference

When type hints are omitted, the decoder infers types automatically:

| Token | Inferred Type |
|-------|---------------|
| Unquoted number | numeric (u32, i32, or f64) |
| Quoted number | string |
| `true` / `false` | boolean |
| `null` | null |
| Everything else | string |

### Type Coercion

In strict mode, values are coerced to match type hints:

```tonl
user{age:u32,name:str,active:bool}:
  age: "25"           # Coerced to number 25
  name: alice         # Coerced to string "alice"
  active: "true"      # Coerced to boolean true
```

## Quoting and Types

### When Strings Need Quotes

TONL quotes strings **only when necessary** to maximize token efficiency. A string must be quoted if:

* It's empty (`""`)
* It has leading or trailing whitespace
* It equals `true`, `false`, or `null` (case-sensitive)
* It looks like a number (e.g., `"42"`, `"-3.14"`, `"1e-6"`, `"05"` with leading zeros)
* It contains special characters: colon (`:`), comma (`,`), hash (`#`), braces (`{}`), brackets (`[]`), quote (`"`), backslash (`\`), or control characters (newline, tab, carriage return)
* It contains the active delimiter character

Otherwise, strings can be unquoted. Unicode, emoji, and strings with internal (non-leading/trailing) spaces are safe unquoted:

```tonl
message: Hello 世界
note: This has inner spaces
emoji: Check this out
```

### Escape Sequences

In quoted strings, the following escape sequences are valid:

| Character | Escape |
|-----------|--------|
| Backslash (`\`) | `\\` |
| Double quote (`"`) | `""` or `\"` |
| Newline (U+000A) | `\n` |
| Carriage return (U+000D) | `\r` |
| Tab (U+0009) | `\t` |

### Quoting Examples

```tonl
# Values requiring quotes
data{field1,field2,field3,field4,field5}:
  field1: "Hello, world"        # Contains comma (delimiter)
  field2: "Key: Value"          # Contains colon
  field3: "She said ""hi"""     # Contains quotes (doubled inside)
  field4: "123"                 # Number-like string
  field5: ""                    # Empty string
```

### Multiline Strings

Triple quotes (`"""`) are used for multiline content:

```tonl
description: """This is a
multi-line string
with preserved formatting"""
```

**Rules:**

* `"""` marks opening (followed by content or newline)
* Content is preserved as-is
* `"""` marks closing
* No escape processing inside triple quotes

### Type Conversions

Numbers are emitted in canonical decimal form. Non-JSON types are normalized before encoding:

| Input | Output |
|-------|--------|
| Finite number | Canonical decimal (e.g., `1e6` → `1000000`) |
| `NaN`, `Infinity`, `-Infinity` | `null` |
| `BigInt` (within safe range) | Number |
| `BigInt` (out of range) | Quoted decimal string |
| `Date` | ISO string in quotes (e.g., `"2025-01-01T00:00:00.000Z"`) |
| `undefined`, `function`, `symbol` | `null` |

## Key Handling

### Valid Identifiers

Keys follow these rules:

* **Characters**: Letters, numbers, underscore (`_`)
* **First character**: Must be a letter or underscore
* **Case sensitivity**: Case-sensitive
* **No reserved words**: But avoid structural characters

```tonl
valid_name: value
isValid123: value
_privateField: value
```

### Quoted Keys (Special Characters)

Keys containing special characters must be quoted:

```tonl
"field-with-dash": value
"key with spaces": value
"@type": value
"#comment": value
```

### Dual-Mode System (v2.0.6+)

TONL offers two modes for handling problematic keys:

**Default Mode (Quoting)** - Perfect round-trip:

```tonl
""[1]:
  empty-value
"#"[1]:
  hash-value
"@type"[1]:
  at-symbol-value
```

**Preprocessing Mode** - Clean, readable keys (`--preprocess` flag):

```tonl
empty[1]:
  empty-value
comment[1]:
  hash-value
type[1]:
  at-symbol-value
```

| Original Key | Preprocessed Key |
|--------------|------------------|
| `""` (empty) | `empty` |
| `"#"` | `comment` |
| `"@type"` | `type` |
| `"key with spaces"` | `key_with_spaces` |

## Comments

TONL supports comments for documentation:

```tonl
@tonl v1

# This is a comment line
order{orderId,status}:
  orderId: ORD-001
  status: processing

# Comments can be placed between blocks
customer{id:u32,name:str}:
  id: 123
  name: "John Doe"
```

Lines starting with `#` (except headers like `#version`) are treated as comments and ignored during parsing.

## Complete Examples

### E-commerce Order

```tonl
@tonl v1

order{orderId,status,placedAt}:
  orderId: ORD-2025-11-001234
  status: processing
  placedAt: 2025-11-03T14:30:00Z

customer{id:u32,name:str,email:str,tier:str}:
  id: 5678
  name: "John Smith"
  email: john.smith@example.com
  tier: premium

items[3]{sku,name,quantity:u32,unitPrice:f64,discount:f64}:
  WIDGET-001, "Premium Widget", 2, 29.99, 0.10
  GADGET-042, "Smart Gadget Pro", 1, 149.99, 0.00
  ACCESSORY-123, "Universal Adapter", 3, 12.99, 0.15

shippingAddress{street,city,state,zip,country}:
  street: "123 Main Street, Apt 4B"
  city: "San Francisco"
  state: CA
  zip: "94105"
  country: USA

summary{subtotal:f64,tax:f64,shipping:f64,discount:f64,total:f64}:
  subtotal: 248.93
  tax: 21.16
  shipping: 9.99
  discount: 13.45
  total: 266.63

notes[2]: "Gift wrap requested", "Leave package at front door"
```

### User Profile with Nested Data

```tonl
#version 1.0

user{id:u32,name:str,email:str,preferences:obj}:
  id: 1
  name: Ahmet Yılmaz
  email: ahmet@example.com
  preferences{language:str,notifications:bool,theme:str}:
    language: tr
    notifications: true
    theme: dark

stats{loginCount:u32,sessionDuration:f64}:
  loginCount: 156
  sessionDuration: 45.2

roles[3]: admin, editor, viewer
```

### Comparison with JSON

**JSON** (245 bytes, ~89 tokens):
```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob, Jr.", "role": "user" },
    { "id": 3, "name": "Carol", "role": "editor" }
  ]
}
```

**TONL** (158 bytes, ~49 tokens - **45% reduction**):
```tonl
#version 1.0
users[3]{id:u32,name:str,role:str}:
  1, Alice, admin
  2, "Bob, Jr.", user
  3, Carol, editor
```

**Key Differences:**

* No redundant field names repeated per row
* No braces or commas around objects
* Values separated by delimiter, not key-value pairs
* Smaller footprint with preserved semantics

## Parsing Considerations

### Indentation-Based Structure

* Objects and arrays are defined by indentation levels
* Child elements are indented 2 spaces deeper than parent (configurable)
* Indentation is significant for block detection

### Line Types

1. **Header lines** - Start with `#` (metadata like `#version`, `#delimiter`)
2. **Directive lines** - Start with `@` (schema annotations like `@tonl v1`)
3. **Block headers** - Contain `{...}` or `[...]` and end with `:`
4. **Field lines** - Indented, contain key-value pairs
5. **Array rows** - Indented, contain delimiter-separated values
6. **Comment lines** - Start with `#` (non-directive)

### Strict vs. Lenient Parsing

**Strict mode** (`strict: true`):
* Enforces count accuracy (`[N]` must match actual count)
* Validates column counts (rows must match header columns)
* Type validation (values must be coercible to specified types)

**Lenient mode** (default):
* Treats `[N]` as advisory
* Handles missing fields gracefully
* Best effort parsing with error recovery

## Smart Encoding

The `encodeSmart()` function or `--smart` CLI flag automatically:

* Analyzes data to choose optimal delimiter
* Avoids delimiters that appear in values
* Selects most token-efficient representation
* Optimizes for LLM consumption

```typescript
import { encodeSmart } from 'tonl';

const data = { users: [{ id: 1, name: "Alice, Admin" }] };
const tonl = encodeSmart(data);
// Automatically switches to pipe delimiter if commas in data
```

For complete specification details, see [SPECIFICATION.md](./SPECIFICATION.md).
