# TONL Examples

This directory contains comprehensive, working examples for all TONL features.

---

## 🚀 Quick Start

All examples are ready to run:

```bash
# Navigate to project root
cd TONL

# Run any example
node examples/query/01-basic-queries.ts
node examples/modification/01-basic-crud.ts
node examples/integration/01-complete-application.ts
```

---

## 📁 Directory Structure

```
examples/
├── query/              ← Query API examples
│   ├── 01-basic-queries.ts
│   └── 02-filter-expressions.ts
├── modification/       ← Modification API examples
│   ├── 01-basic-crud.ts
│   └── 02-transactions.ts
├── indexing/          ← Indexing examples
│   └── 01-basic-indexing.ts
├── streaming/         ← Streaming examples
│   └── 01-large-files.ts
└── integration/       ← Complete application examples
    └── 01-complete-application.ts
```

---

## 📚 Examples By Feature

### Query API

**01-basic-queries.ts** - Learn the basics
- Simple property access
- Nested property access
- Array indexing (positive/negative)
- Path existence checking
- Type inspection
- Wildcards
- Recursive descent

**02-filter-expressions.ts** - Advanced filtering
- Comparison operators (>, <, >=, <=, ==, !=)
- Logical operators (&&, ||, !)
- Complex conditions
- Real-world scenarios

**What you'll learn:**
- How to query any data structure
- Filter syntax and operators
- Wildcard and recursive queries
- Performance characteristics

### Modification API

**01-basic-crud.ts** - CRUD operations
- CREATE: Adding new data with path creation
- READ: Querying data
- UPDATE: Modifying existing data
- DELETE: Removing data
- Method chaining

**02-transactions.ts** - Safe modifications
- Creating snapshots
- Tracking changes with diff()
- Rollback patterns
- Safe modification workflow
- Change auditing

**What you'll learn:**
- Full CRUD operation set
- Automatic path creation
- Change tracking
- Safe update patterns
- Rollback strategies

### Indexing

**01-basic-indexing.ts** - Fast lookups
- Hash index creation (O(1))
- BTree index for range queries (O(log n))
- Index management
- Performance comparison
- Statistics and monitoring

**What you'll learn:**
- When to use hash vs btree indices
- Index creation and management
- Performance benefits
- Memory usage

### Streaming

**01-large-files.ts** - Memory-efficient processing
- Stream query with filter/limit
- Aggregation functions
- Pipeline transformations
- Memory efficiency
- File statistics

**What you'll learn:**
- Processing multi-GB files
- Constant memory usage
- Aggregation patterns
- Pipeline composition

### Integration

**01-complete-application.ts** - Real-world application
- Complete user management system
- All features working together
- Index creation for fast lookups
- CRUD operations
- Change tracking
- Atomic file saves
- Statistics and monitoring

**What you'll learn:**
- How to structure a real application
- Using multiple features together
- Best practices
- Production patterns

---

## 🎯 Learning Path

### Beginner (Start Here)
1. `query/01-basic-queries.ts` - Learn to query data
2. `modification/01-basic-crud.ts` - Learn to modify data
3. `integration/01-complete-application.ts` - See it all together

### Intermediate
1. `query/02-filter-expressions.ts` - Master filters
2. `modification/02-transactions.ts` - Safe modifications
3. `indexing/01-basic-indexing.ts` - Fast lookups

### Advanced
1. `streaming/01-large-files.ts` - Large file processing
2. Build your own application combining all features

---

## ✅ Example Test Matrix

All examples have been tested and verified:

| Example | Status | Features Demonstrated |
|---------|--------|----------------------|
| query/01-basic-queries | ✅ | Simple paths, nested access, wildcards, recursive descent |
| query/02-filter-expressions | ✅ | All operators, complex conditions, real-world filters |
| modification/01-basic-crud | ✅ | Set, delete, push, pop, merge, chaining |
| modification/02-transactions | ✅ | Snapshots, diff, rollback, safe patterns |
| indexing/01-basic-indexing | ✅ | Hash (O(1)), BTree (O(log n)), management |
| streaming/01-large-files | ✅ | Stream query, aggregate, pipeline, memory efficiency |
| integration/01-complete-application | ✅ | All features in realistic scenario |

**Result:** 7/7 examples working perfectly! ✅

---

## 🔧 Running Examples

### Run Individual Example
```bash
node examples/query/01-basic-queries.ts
```

### Run All Query Examples
```bash
node examples/query/01-basic-queries.ts
node examples/query/02-filter-expressions.ts
```

### Run All Examples (Automated)
```bash
# Create a script to run all
for file in examples/**/*.ts; do
  echo "Running $file..."
  node "$file"
  echo "---"
done
```

---

## 📖 Additional Resources

### Documentation
- [Getting Started Guide](../docs/GETTING_STARTED.md)
- [Query API Reference](../docs/QUERY_API.md)
- [Navigation API Reference](../docs/NAVIGATION_API.md)
- [Modification API Guide](../docs/MODIFICATION_API.md)

### API Reference
- See TypeScript types and JSDoc in source code
- IntelliSense will show all available methods
- Check `dist/*.d.ts` files for type definitions

### Community
- GitHub: https://github.com/ersinkoc/tonl
- Issues: https://github.com/ersinkoc/tonl/issues

---

## 🎓 Next Steps

After running these examples:

1. **Build something!** - Use TONL in your project
2. **Explore the API** - Check out the full documentation
3. **Try the REPL** - Interactive exploration with `tonl` command
4. **Contribute** - Found a bug or have an idea? Open an issue!

---

## 💡 Tips

- Start with simple examples and gradually explore advanced features
- Use TypeScript for better IntelliSense and type safety
- Check console output for detailed results
- Modify examples to experiment with your own data
- Reference the main documentation for complete API details

---

**Happy coding with TONL! 🚀**
