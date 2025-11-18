# 🎮 TONL v2.2.0 Interactive CLI Cheat Sheet

## 🚀 Quick Start

```bash
# Install
npm install -g tonl

# Interactive dashboard (NEW!)
tonl stats data.json --interactive

# Help
tonl --help
```

## 🎮 **Interactive Mode Commands**

### Basic Interactive Usage
```bash
# Launch interactive dashboard
tonl stats data.json --interactive
tonl stats data.json -i

# Launch without file for menu exploration
tonl stats --interactive
tonl stats -i

# Interactive with specific theme
tonl stats data.json -i --theme neon
tonl stats data.json --interactive --theme matrix
```

### 🎨 **Theme Options**
```bash
# Available themes: default, neon, matrix, cyberpunk
tonl stats data.json -i --theme neon        # Bright neon colors
tonl stats data.json -i --theme matrix      # Green matrix style
tonl stats data.json -i --theme cyberpunk   # Cyan/purple cyberpunk
tonl stats data.json -i --theme default     # Clean terminal colors
```

### ⚖️ **File Comparison**
```bash
# Compare JSON vs TONL files
tonl stats data.json --compare

# Interactive comparison with themes
tonl stats data.json --compare --theme neon

# Interactive comparison mode
tonl stats data.json -i --compare
```

### 🔍 **Multi-Tokenizer Analysis**
```bash
# Compare token costs across different LLMs
tonl stats large-dataset.json --tokenizer gpt-5
tonl stats large-dataset.json --tokenizer claude-3.5
tonl stats large-dataset.json --tokenizer gemini-2.0
tonl stats large-dataset.json --tokenizer llama-4
tonl stats large-dataset.json --tokenizer o200k
tonl stats large-dataset.json --tokenizer cl100k
```

## 📊 **Standard Commands**

### Encode Commands
```bash
# Basic encode
tonl encode data.json --out data.tonl

# Smart encoding with stats
tonl encode data.json --smart --stats --out data.tonl

# Custom delimiter and formatting
tonl encode data.json --delimiter "|" --include-types --out data.tonl

# Encode with preprocessing (clean keys)
tonl encode data.json --preprocess --out data.tonl
```

### Decode Commands
```bash
# Basic decode
tonl decode data.tonl --out data.json

# Strict parsing mode
tonl decode data.tonl --out data.json --strict
```

### Stats Commands
```bash
# Show statistics
tonl stats data.json
tonl stats data.tonl

# With custom tokenizer
tonl stats data.json --tokenizer gpt-5

# Interactive mode (most popular!)
tonl stats data.json --interactive
```

### Format Commands
```bash
# Format TONL file
tonl format data.tonl --pretty --out formatted.tonl

# Custom indentation
tonl format data.tonl --indent 4 --out formatted.tonl

# Include type hints
tonl format data.tonl --include-types --out formatted.tonl
```

### Query Commands
```bash
# Query with JSONPath expressions
tonl query users.tonl "users[?(@.age > 25)]"
tonl query data.tonl "$..email"  # All emails recursively

# Get specific path
tonl get data.json "user.profile.email"
```

### Validation Commands
```bash
# Validate against schema
tonl validate users.tonl --schema users.schema.tonl --strict
```

## 🎯 **Interactive Menu Options**

When you launch interactive mode, you'll see these options:

```
🚀 TONL Interactive Stats Dashboard
=====================================
📊 Analyzing your-file.json...
✅ Analysis complete!

Options:
1. 📊 Analyze another file
2. ⚖️ Compare two files
3. 🎨 Change theme
4. 🔍 Change tokenizer
5. 📈 Detailed statistics
6. ❌ Exit
Choose an option (1-6):
```

## 🔧 **Advanced Options**

### Delimiters
```bash
# Custom field delimiters
tonl encode data.json --delimiter "|"    # Pipe delimiter
tonl encode data.json --delimiter ";"    # Semicolon delimiter
tonl encode data.json --delimiter "\t"   # Tab delimiter
```

### Output Options
```bash
# Output to file
tonl encode data.json --out output.tonl
tonl decode data.tonl --out output.json

# Output to stdout (default)
tonl encode data.json
```

### Version & Help
```bash
# Show version
tonl --version
tonl -v

# Show help
tonl --help
tonl
```

## 💡 **Pro Tips**

### 🔥 **Most Useful Combinations**
```bash
# Interactive analysis with custom theme
tonl stats big-data.json -i --theme neon

# Compare compression with multiple tokenizers
tonl stats data.json --compare --theme matrix

# Smart encode with optimization stats
tonl encode data.json --smart --stats --out optimized.tonl

# Clean encoding for problematic keys
tonl encode data.json --preprocess --out clean.tonl
```

### 🎨 **Theme Recommendations**
```bash
# For daily use: default (easy on eyes)
tonl stats data.json -i --theme default

# For presentations: neon (bright, impressive)
tonl stats data.json -i --theme neon

# For hacker aesthetic: matrix (classic green)
tonl stats data.json -i --theme matrix

# For modern feel: cyberpunk (futuristic colors)
tonl stats data.json -i --theme cyberpunk
```

### 📊 **Analysis Workflow**
```bash
# 1. Quick overview
tonl stats data.json

# 2. Interactive deep dive
tonl stats data.json --interactive --theme neon

# 3. Compare compression
tonl stats data.json --compare

# 4. Optimize for LLM tokens
tonl stats data.json --tokenizer gpt-5
```

## 🐛 **Troubleshooting**

### Common Issues
```bash
# If interactive mode doesn't start
tonl stats --help  # Check if interactive flag is supported

# If file not found
tonl encode "$(pwd)/data.json"  # Use full path

# If permissions issue
sudo npm install -g tonl  # For global installation
```

### Getting Help
```bash
# Show all options
tonl --help

# Get help for specific command
tonl encode --help
tonl stats --help
```

## 🚀 **Examples**

### Real-World Scenarios
```bash
# Analyze package.json for token optimization
tonl stats package.json -i --theme neon --tokenizer gpt-5

# Compare JSON vs TONL compression
tonl stats config.json --compare --theme matrix

# Clean up API response with problematic keys
tonl encode api-response.json --preprocess --out clean.tonl

# Quick format and prettify
tonl format messy.tonl --pretty --out nice.tonl

# Validate configuration against schema
tonl validate production.tonl --schema prod.schema.tonl --strict
```

### Data Analysis Pipeline
```bash
# Step 1: Analyze original data
tonl stats original.json --interactive

# Step 2: Optimize and encode
tonl encode original.json --smart --stats --out optimized.tonl

# Step 3: Compare results
tonl stats original.json --compare --theme neon

# Step 4: Validate compression
tonl decode optimized.tonl --out restored.json
diff original.json restored.json
```

## 🎉 **Interactive Demo Flow**

```bash
# Start interactive experience
tonl stats sample-data.json --interactive --theme neon

# You'll see:
# 1. File analysis with progress bars
# 2. Compression statistics
# 3. Interactive menu options
# 4. Beautiful colored output

# Try these in the menu:
# - Option 1: Analyze different files
# - Option 2: Compare compression ratios
# - Option 3: Switch themes (neon! matrix! cyberpunk!)
# - Option 4: Change tokenizers (gpt-5! claude-3.5!)
# - Option 5: View detailed statistics
# - Option 6: Clean exit
```

## 💫 **Key Benefits of v2.2.0**

✅ **Real-time Analysis** - Watch files being analyzed live
✅ **Beautiful Themes** - 4 stunning visual themes
✅ **Interactive Comparison** - Side-by-side file analysis
✅ **Multi-Tokenizer Support** - GPT-5, Claude-3.5, Gemini-2.0, Llama-4
✅ **Modular Architecture** - Clean, maintainable codebase
✅ **100% Test Coverage** - 791+ tests with perfect success rate
✅ **Cross-Platform** - Windows, Linux, macOS compatible

---

**Ready to revolutionize your CLI experience?** 🚀

```bash
npm install -g tonl
tonl stats your-data.json --interactive --theme neon
```

Enjoy the interactive revolution! 🎮✨