# TONL Roadmap

This document outlines the future development plans for TONL (Token-Optimized Notation Language).

> 📘 **Strategic Plan**: For comprehensive strategic planning and detailed implementation guides, see [STRATEGIC_PLAN.md](STRATEGIC_PLAN.md)

---

## Current Status (v0.5.1) - ✅ Released

**November 4, 2025** - **Critical Bug Fix Release**

### ✅ Completed Features
- [x] Core encode/decode functionality with 100% test coverage
- [x] CLI with encode/decode/stats/format/validate commands
- [x] Smart encoding with delimiter optimization
- [x] Type inference and schema hints
- [x] Complete test suite (115/115 tests passing)
- [x] Performance benchmarks (32-45% compression)
- [x] Full documentation (README, API, SPECIFICATION, CLI, SCHEMA)
- [x] Round-trip JSON compatibility **with critical bug fixes**
- [x] Multiple delimiter support (`,` `|` `\t` `;`)
- [x] Nested object/array handling
- [x] 16 LLM tokenizer models supported (GPT-5, Claude 3.5, Gemini 2.0, etc.)
- [x] Real-world token estimation algorithms
- [x] Enhanced CLI with comprehensive tokenizer support
- [x] Pretty print formatting for TONL files
- [x] Cross-platform CLI support (Windows, macOS, Linux)
- [x] Schema validation system with TSL v1.0
- [x] TypeScript strict mode (100% type safety)
- [x] Modular parser architecture (6 focused modules)
- [x] Streaming API for large files (Node.js streams)
- [x] Browser support with multiple bundle formats
- [x] Async iterators for modern JavaScript
- [x] Robust null value handling in typed fields
- [x] **NEW:** Production-grade round-trip safety (10 critical bugs fixed)
- [x] **NEW:** Circular reference detection
- [x] **NEW:** Complete edge case test coverage

### 📊 Current Metrics
- **Test Coverage**: 100% (115/115 tests passing) ⬆️ +15 tests
- **Test Suites**: 35 comprehensive test suites ⬆️ +5 suites
- **Runtime Dependencies**: 0 (pure TypeScript)
- **Code Quality**: Modular architecture, strict TypeScript
- **Performance**: 32-45% byte reduction, 39-45% token reduction vs JSON
- **Bundle Size**: <7KB gzipped (browser bundles)
- **Platform Support**: Node.js, Browser, Windows, macOS, Linux
- **Round-Trip Safety**: ✅ Production-ready (10 critical bugs fixed)

---

## Phase 1: Foundation Hardening (v0.4.0)
**Timeline:** November 2025 - January 2026 (2-3 Months)
**Goal:** Enterprise-ready reliability and developer experience

### 🔴 Critical Priorities

#### Code Quality & Technical Debt

- [x] ✅ **Type Safety Hardening**: **COMPLETED**
  - ✅ Fix `tsconfig.json`: Set `"noImplicitAny": true`
  - ✅ Eliminate all `any` types from codebase (zero explicit any)
  - ✅ Add comprehensive type guards
  - ✅ **Target ACHIEVED**: 100% TypeScript strict mode compliance

- [x] ✅ **Parser Refactoring**: **COMPLETED**
  - ✅ Split `decode.ts` (649 LOC) into 6 modular components
  - ✅ Create `src/parser/` directory with focused modules
  - ✅ Reduce cyclomatic complexity (<10 per function)
  - ✅ **Target ACHIEVED**: No file >320 LOC, 100% test coverage maintained

#### Schema Validation System 🌟 FLAGSHIP FEATURE - **COMPLETED**

- [x] ✅ **TONL Schema Language (TSL)**: Design and implementation COMPLETE
  ```tonl
  # Example schema
  @schema v1
  users: list<obj>
    id: u32 required
    name: str required min:2 max:100
    email: str required pattern:email
  ```
- [x] ✅ **Schema Parser**: Load and parse `.schema.tonl` files - WORKING
- [x] ✅ **Validation Engine**: Runtime validation with detailed error messages - WORKING
- [ ] ⏳ **TypeScript Generation**: `tonl generate-types schema.tonl --output types.ts` (Moved to v0.4.1)
- [x] ✅ **CLI Integration**: `tonl validate data.tonl --schema schema.tonl` - COMPLETE
- [x] ✅ **Documentation**: Complete schema specification and examples - DONE

#### Enhanced Error Reporting
- [ ] **Rich Error Messages**:
  - Line/column tracking in parser
  - Source code snippets in errors
  - Helpful suggestions for common mistakes
  - Color-coded CLI output
  ```
  Error at line 15:23 in data.tonl
    15 |   2,Jane,invalid-email
                  ^^^^^^^^^^^^^
  Expected valid email format
  💡 Suggestion: Wrap value in quotes or check schema
  ```

#### CLI Enhancements
- [ ] **Stream Support**: Stdin/stdout pipes (`cat data.json | tonl encode`)
- [ ] **Batch Processing**: `tonl batch encode *.json --parallel 4`
- [ ] **Progress Indicators**: Real-time progress for large files
- [ ] **Watch Mode**: `tonl watch data.json --output data.tonl`

### 📋 Success Criteria
- ✅ 100% type safety with strict TypeScript
- ✅ Schema validation with 95%+ accuracy
- ✅ Parser refactored (no file >250 LOC)
- ✅ Enhanced error reporting with line/column
- ✅ CLI stdin/stdout support
- ✅ 100+ GitHub stars

**Release Target:** January 31, 2026

---

## Phase 2: Platform Expansion (v0.5.0) - ✅ COMPLETED
**Timeline:** February 2026 - April 2026 (3 Months) - **SHIPPED EARLY: November 2025**
**Goal:** Multi-platform support and streaming capabilities

### ✅ Completed Features

#### Streaming API 🌟 FLAGSHIP FEATURE - ✅ COMPLETED
- [x] ✅ **Node.js Streams**: Full stream compatibility with backpressure handling
  ```typescript
  import { createEncodeStream, createDecodeStream } from 'tonl/stream';

  // Encode large files
  createReadStream('huge.json')
    .pipe(createEncodeStream({ smart: true }))
    .pipe(createWriteStream('huge.tonl'));
  ```
- [x] ✅ **Async Iterators**: Modern async iteration API
- [x] ✅ **Web Streams**: Browser-compatible TransformStream
- [x] ✅ **Performance**: Handle 100GB+ files with <100MB memory
- [x] ✅ **Documentation**: Complete streaming guide with examples

#### Browser Support & Distribution - ✅ COMPLETED
- [x] ✅ **Build Configuration**: Multi-format bundles (ESM, UMD, IIFE)
- [x] ✅ **Bundle Targets**:
  - `tonl.esm.js` - Modern ES modules (6.32 KB gzipped - **10x better than target!**)
  - `tonl.umd.js` - Universal module (4.53 KB gzipped - **10x better than target!**)
  - `tonl.min.js` - Minified production (4.45 KB gzipped - **9x better than target!**)
- [x] ✅ **CDN Distribution**:
  - JSDelivr: `https://cdn.jsdelivr.net/npm/tonl@0.5.0/+esm`
  - unpkg: `https://unpkg.com/tonl@0.5.0`
- [x] ✅ **Web Worker Support**: Background processing for large datasets
- [x] ✅ **Browser Testing**: Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### 🟡 High Priority

#### Web Playground
- [ ] **Interactive Converter**: Live JSON ↔ TONL conversion
- [ ] **Monaco Editor**: VS Code-like editing experience
- [ ] **Features**:
  - Real-time token cost comparison (multiple LLM models)
  - Shareable URLs (Base64 encoded state)
  - Example datasets library
  - Syntax highlighting and error visualization
  - Mobile responsive design
- [ ] **Deployment**: Host on Vercel at `tonl.dev/playground`
- [ ] **Analytics**: Track usage for feature prioritization

### 📋 Success Criteria
- ✅ **ACHIEVED**: Streaming API handling 100GB+ files
- ✅ **EXCEEDED**: Browser bundle <7KB gzipped (10x better than 50KB target!)
- 🎯 **IN PROGRESS**: Web playground with 1K+ monthly users
- 🎯 **IN PROGRESS**: NPM downloads 1K+/week
- 🎯 **IN PROGRESS**: 300+ GitHub stars

**Release Target:** April 30, 2026 - **✅ SHIPPED EARLY: November 3, 2025**

---

## Phase 3: Ecosystem Growth (v0.6.0)
**Timeline:** May 2026 - July 2026 (3 Months)
**Goal:** Multi-language support and developer tools

### 🔴 Critical Priorities

#### Python Binding 🌟 FLAGSHIP FEATURE
**Why Python?** ML/AI community's primary language, critical for LangChain/LlamaIndex integration

- [ ] **Pure Python Implementation**: Zero dependencies, easy installation
  ```python
  import tonl

  # Encoding
  data = {'users': [{'id': 1, 'name': 'John'}]}
  encoded = tonl.encode(data, smart=True)

  # Decoding with schema
  schema = tonl.load_schema('schema.tonl')
  decoded = tonl.decode(encoded, schema=schema, strict=True)
  ```
- [ ] **PyPI Package**: Publish to Python Package Index
- [ ] **Streaming Support**: `tonl.open()` for large files
- [ ] **Pandas Integration**: `pd.read_tonl()` and `df.to_tonl()`
- [ ] **Jupyter Support**: Magic commands for notebooks
- [ ] **Complete Documentation**: Python-specific guides and examples
- [ ] **100% Test Coverage**: Parity with TypeScript implementation

### 🟡 High Priority

#### VS Code Extension
- [ ] **Language Support**: Syntax highlighting for `.tonl` files
- [ ] **IntelliSense**: Auto-completion and hover documentation
- [ ] **Error Squiggles**: Inline validation with suggestions
- [ ] **Format on Save**: Automatic formatting
- [ ] **Schema Integration**: Validation against `.schema.tonl` files
- [ ] **Marketplace**: Publish to VS Code Marketplace

#### Developer Tools
- [ ] **Prettier Plugin**: `prettier-plugin-tonl` for auto-formatting
- [ ] **ESLint Plugin**: `eslint-plugin-tonl` for linting
- [ ] **EditorConfig**: Standard editor configuration
- [ ] **GitHub Actions**: CI/CD workflow templates

### 📋 Success Criteria
- ✅ Python package on PyPI
- ✅ VS Code extension with 500+ installs
- ✅ Prettier & ESLint plugins
- ✅ 5K+ NPM downloads/week
- ✅ 1K+ GitHub stars
- ✅ 5+ production case studies

**Release Target:** July 31, 2026

---

## Phase 4: Advanced Features (v0.7.0+)
**Timeline:** August 2026 - January 2027 (6 Months)
**Goal:** Advanced algorithms and framework integrations

### 🟡 Medium Priority

#### Binary Format
- [ ] **TONL Binary Specification**: Design binary format (TONLB)
  - VLQ encoding for numbers
  - Dictionary compression for strings
  - Schema-aware binary encoding
  - Zero-copy deserialization
- [ ] **Performance Targets**:
  - 60-70% byte reduction vs JSON
  - 5-10x faster parsing than text format
- [ ] **API**: `encodeTONLBinary()` and `decodeTONLBinary()`

#### Additional Language Bindings
- [ ] **Go Library**: `go get github.com/ersinkoc/tonl-go`
  - Native Go implementation
  - Standard library integration
  - High-performance parsing
- [ ] **Rust Library**: `cargo add tonl`
  - Zero-copy parsing
  - WASM compilation target
  - Performance-critical applications

#### Framework Integrations
- [ ] **Express.js Middleware**: `tonlParser()` and `tonlSerializer()`
- [ ] **Fastify Plugin**: `@tonl/fastify`
- [ ] **Database Adapters**: PostgreSQL, MongoDB native types
- [ ] **GraphQL Integration**: TONL scalar type

### 🔬 Research & Experimental

#### Advanced Algorithms
- [ ] **Delta Encoding**: Efficient difference encoding for versioned data
- [ ] **Dictionary Compression**: Custom dictionary support for domain-specific data
- [ ] **Adaptive Encoding**: AI-powered format selection
- [ ] **Compression Algorithms**: Integration with zstd, lz4

### 📋 Success Criteria
- ✅ Binary format specification complete
- ✅ Go and Rust packages published
- ✅ Framework integrations (2+ frameworks)
- ✅ 20K+ NPM downloads/week
- ✅ 2K+ GitHub stars

**Release Target:** January 31, 2027

---

## Production Ready (v1.0.0)
**Timeline:** February 2027+
**Goal:** Stable API, enterprise features, full ecosystem

### 🎯 Version 1.0 Criteria
- [ ] **Multi-Language Support**: JavaScript, Python, Go, Rust
- [ ] **Binary Format**: Production-ready TONLB
- [ ] **Framework Integrations**: 5+ framework/database integrations
- [ ] **Schema System**: Complete with evolution/migration
- [ ] **Enterprise Features**: SLA, support, compliance documentation
- [ ] **Performance**: Benchmarks vs all major formats
- [ ] **Documentation**: Complete guides for all platforms
- [ ] **Community**: 100+ production users, active contributor base

### 📊 Success Metrics
- ✅ 20K+ weekly downloads (all packages combined)
- ✅ 2K+ GitHub stars
- ✅ 100+ production companies
- ✅ Official LLM provider integration (OpenAI, Anthropic, or Google)
- ✅ 5+ academic citations
- ✅ 3+ conference presentations
- ✅ 25+ active contributors

---

## Community & Ecosystem

### 🤝 Community Building (Ongoing)

#### Infrastructure
- [ ] **GitHub Discussions**: Primary community forum
- [ ] **Discord Server**: Real-time chat and support
- [ ] **Twitter/X Account**: Updates and tips
- [ ] **Dev.to Blog**: Technical articles (monthly)
- [ ] **Newsletter**: Monthly community updates

#### Content & Documentation
- [ ] **Tutorial Series**: Step-by-step learning paths
- [ ] **Integration Guides**: Platform-specific guides (Express, Django, etc.)
- [ ] **Best Practices**: Recommended usage patterns
- [ ] **Video Tutorials**: YouTube channel
- [ ] **Case Studies**: Real-world production examples

#### Contributor Experience
- [ ] **CONTRIBUTING.md**: Clear contribution process
- [ ] **Code of Conduct**: Community behavior standards
- [ ] **Issue Templates**: Standardized bug reports and feature requests
- [ ] **PR Templates**: Consistent pull request format
- [ ] **Contributor Recognition**: Credits, badges, hall of fame

#### Outreach Strategy
- [ ] **Conference Talks**: Submit to PyCon, JSConf, MLConf
- [ ] **Blog Posts**: HackerNews, Reddit, Dev.to
- [ ] **Partnerships**: LLM providers, data platforms, developer tools
- [ ] **Open Source**: LangChain, LlamaIndex, Hugging Face integrations

---

## Release Timeline

| Version | Target Date | Status | Focus | Key Features |
|---------|-------------|--------|-------|--------------|
| v0.2.0 | Oct 6, 2025 | ✅ Released | Initial Release | Core functionality |
| v0.3.0 | Oct 16, 2025 | ✅ Released | Tokenizer Updates | 16 models supported |
| v0.3.3 | Nov 3, 2025 | ✅ Released | Format & Cross-Platform | Format command, CLI fixes |
| v0.3.5 | Nov 3, 2025 | ✅ Released | Production Ready | Stability improvements |
| **v0.4.0** | **Nov 3, 2025** | **✅ Released** | **Foundation Hardening** | **Schema validation, type safety** |
| **v0.5.0** | **Nov 3, 2025** | **✅ Released** | **Platform Expansion** | **Streaming API, browser support** |
| **v0.5.1** | **Nov 4, 2025** | **✅ Released (Current)** | **Bug Fixes** | **10 critical bugs fixed, production-ready round-trip** |
| **v0.6.0** | **Jul 31, 2026** | 🎯 Planned | **Ecosystem Growth** | **Python, VS Code, dev tools** |
| **v0.7.0** | **Jan 31, 2027** | 🎯 Planned | **Advanced Features** | **Binary format, Go/Rust** |
| **v1.0.0** | **Q2 2027** | 🎯 Planned | **Production Ready** | **Stable API, enterprise features** |

---

## 📝 Notes & Principles

### Development Philosophy
- **Quality First**: Maintain 100% test coverage, zero compromises
- **Performance Focused**: Token efficiency is our core value proposition
- **Developer Experience**: Simple APIs, excellent documentation, helpful errors
- **Community Driven**: Listen to users, transparent roadmap, open governance
- **Backward Compatible**: Minimize breaking changes, clear migration paths

### Prioritization Framework
We prioritize features using this framework:

1. **Critical (P1)**: Blocking adoption or causing security/reliability issues
   - Example: Schema validation (enterprise requirement)
   - Example: Python binding (ML/AI community access)

2. **High (P2)**: Significant user value or ecosystem growth
   - Example: Streaming API (large file support)
   - Example: VS Code extension (developer experience)

3. **Medium (P3)**: Nice to have, improves experience
   - Example: Binary format (performance optimization)
   - Example: Additional language bindings

4. **Research**: Experimental, future potential
   - Example: AI-powered adaptive encoding
   - Example: Delta compression algorithms

### Release Principles
- **Semantic Versioning**: MAJOR.MINOR.PATCH strictly followed
- **Release Cadence**: ~3 months between minor versions
- **Beta Releases**: 2 weeks before stable for community testing
- **LTS Support**: v1.0+ gets 12 months of backports
- **Deprecation Policy**: 6 months notice, migration guide required

### Success Metrics Priority
1. **Technical Quality**: Test coverage, performance, reliability
2. **Adoption**: Downloads, stars, production users
3. **Community**: Contributors, Discord members, engagement
4. **Impact**: LLM provider integrations, academic citations

---

## 🎯 Current Sprint (Next 2 Weeks)

**Focus:** Foundation setup and quick wins

### Week 1 (Nov 4-10, 2025)
- [x] ✅ Create STRATEGIC_PLAN.md
- [x] ✅ Update ROADMAP.md
- [x] ✅ Update CONTRIBUTING.md
- [x] ✅ Fix `tsconfig.json` (noImplicitAny: true)
- [x] ✅ Audit codebase for `any` types (13 → 0 explicit any)
- [x] ✅ Begin parser refactoring (utils, line-parser, value-parser modules created)
- [x] ✅ Draft schema language specification (SCHEMA_SPECIFICATION.md)
- [ ] 🐛 Set up GitHub issue/PR templates
- [ ] 💬 Enable GitHub Discussions

### Week 2 (Nov 11-17, 2025)
- [ ] 🏗️ Complete parser refactoring (block-parser, content-parser)
- [ ] 📄 Implement schema parser (TSL v1)
- [ ] ✅ Implement basic validation engine
- [ ] 📢 First blog post: "Introducing TONL"
- [ ] 🎯 Set up project board for v0.4.0

---

## 🚀 Getting Involved

### For Contributors
- 📖 Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- 🐛 Check [Issues](https://github.com/ersinkoc/tonl/issues) for good first issues
- 💬 Join [Discussions](https://github.com/ersinkoc/tonl/discussions) for Q&A
- 📚 Browse [docs/](docs/) for technical details

### For Users
- ⭐ Star the repo to show support
- 🐞 Report bugs via [Issues](https://github.com/ersinkoc/tonl/issues)
- 💡 Request features in [Discussions](https://github.com/ersinkoc/tonl/discussions)
- 📣 Share your use cases and success stories

### For Organizations
- 🤝 Become a sponsor (details coming soon)
- 🎯 Provide feedback on enterprise requirements
- 📊 Share production metrics and benchmarks
- 🔗 Partner on integrations and ecosystem tools

---

## 📚 Additional Resources

- **Strategic Plan**: [STRATEGIC_PLAN.md](STRATEGIC_PLAN.md) - Detailed implementation guide
- **API Documentation**: [docs/API.md](docs/API.md) - Complete API reference
- **Specification**: [docs/SPECIFICATION.md](docs/SPECIFICATION.md) - Format specification
- **CLI Guide**: [docs/CLI.md](docs/CLI.md) - Command-line tool documentation
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) - Version history

---

**Document Version:** 2.0 (Strategic Roadmap)
**Last Updated:** November 3, 2025
**Next Review:** December 1, 2025

**Let's build the future of LLM-optimized data serialization together!** 🚀