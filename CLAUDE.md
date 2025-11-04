# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TONL** (Token-Optimized Notation Language) is a TypeScript library that provides a text-first, LLM-friendly serialization format designed to reduce token costs in language model prompts while maintaining human readability. The project offers both a programmatic API and CLI tool for converting between JSON and TONL formats.

## Development Commands

```bash
# Build and test
npm run build              # TypeScript compilation
npm test                   # Build and run test suite (100 tests)
npm run dev                # Watch mode development
npm run clean              # Clean build artifacts

# Benchmarking and performance analysis
npm run bench              # Byte size compression analysis
npm run bench-tokens       # Token estimation across multiple LLM models
npm run bench-comprehensive # Full performance analysis

# CLI development
npm run link               # Install tonl command locally for testing
```

## Testing

- **Framework**: Node.js built-in test runner (`node:test`)
- **Test file**: `test/encode_decode_roundtrip.test.ts`
- **Coverage**: 100% test coverage (100/100 tests passing)
- **Test command**: `npm test` (automatically builds before testing)

Run single test: `node --test test/encode_decode_roundtrip.test.ts`

## Architecture

### Core Components (`src/`)

- **`types.ts`** - Core type definitions and interfaces for the TONL format
- **`index.ts`** - Main entry point exporting public API (`encodeTONL`, `decodeTONL`, `encodeSmart`)
- **`encode.ts`** - JSON to TONL conversion with nested structure support
- **`decode.ts`** - TONL to JSON conversion (orchestrates modular parser)
- **`parser.ts`** - Low-level parsing utilities for TONL lines, headers, and delimiter detection
- **`infer.ts`** - Type inference and coercion utilities
- **`cli.ts`** - Command-line interface with `encode`, `decode`, `stats`, `format`, `validate`, `generate-types` commands

### Parser Modules (`src/parser/`)

- **`content-parser.ts`** - Document-level parsing orchestration
- **`block-parser.ts`** - Multi-line block and array parsing
- **`value-parser.ts`** - Single-line object and inline value parsing
- **`line-parser.ts`** - Primitive value parsing
- **`utils.ts`** - Parser helper functions
- **`index.ts`** - Public parser exports

### Utility Modules (`src/utils/`)

- **`strings.ts`** - String handling, quoting, escaping, and indentation utilities
- **`metrics.ts`** - Token estimation across multiple LLM tokenizers (GPT-5, Claude 3.5, Gemini 2.0, Llama 4)

### Key Features

- **Smart Encoding**: Automatically analyzes content to choose optimal delimiters and formatting
- **Multi-delimiter Support**: `,`, `|`, `\t`, `;` with auto-detection
- **Type Hints**: Optional schema information for validation
- **Round-trip Safety**: Perfect bidirectional conversion with JSON
- **Token Optimization**: 32-45% token reduction compared to JSON

## CLI Usage Examples

```bash
# Encode JSON to TONL with smart optimization
tonl encode data.json --out data.tonl --smart --stats

# Decode TONL back to JSON
tonl decode data.tonl --out data.json

# Compare token costs across different models
tonl stats data.json --tokenizer gpt-5

# Format TONL file with specific delimiter
tonl format data.tonl --delimiter "," --out formatted.tonl
```

## Development Workflow

1. **Changes**: Edit TypeScript files in `src/`
2. **Build**: Run `npm run build` to compile to `dist/`
3. **Test**: Run `npm test` to verify functionality
4. **CLI Testing**: Use `npm run link` to install CLI locally
5. **Benchmark**: Use `npm run bench*` commands for performance analysis

## File Structure Patterns

- Source code in `src/` with modular separation
- Test suite in `test/` with comprehensive round-trip testing
- Benchmarks in `bench/` with sample fixtures in `bench/fixtures/`
- Compiled output in `dist/` (auto-generated, don't edit)
- Documentation in `docs/` (API.md, CLI.md, SPECIFICATION.md)

## Configuration

- **TypeScript**: ES2022 target, strict mode enabled
- **Module System**: ES modules with `"type": "module"`
- **Node.js**: Requires >= 18.0.0
- **Dependencies**: Zero runtime dependencies (pure TypeScript)
- **CLI**: Distributed as `dist/cli.js` with `tonl` command

## Testing Strategy

The test suite focuses on encode/decode round-trip fidelity across:
- Simple objects, arrays, nested structures
- Special characters, multiline strings, quoting
- Null/undefined handling, different delimiters
- Error handling and strict mode validation
- All supported data types and edge cases

When adding new features, ensure corresponding round-trip tests are added to maintain 100% test coverage.