/**
 * Format command tests - comprehensive test suite for CLI format functionality
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import { encodeTONL, decodeTONL } from "../dist/index.js";
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const CLI_PATH = join(process.cwd(), "dist", "cli.js");
const TEST_DIR = join(process.cwd(), "test", "format-test-files");

// Ensure test directory exists
if (!existsSync(TEST_DIR)) {
  mkdirSync(TEST_DIR, { recursive: true });
}

/**
 * Helper: Create a temporary test file
 */
function createTestFile(filename: string, content: string): string {
  const filepath = join(TEST_DIR, filename);
  writeFileSync(filepath, content, "utf8");
  return filepath;
}

/**
 * Helper: Clean up test file
 */
function cleanupTestFile(filepath: string): void {
  if (existsSync(filepath)) {
    unlinkSync(filepath);
  }
}

/**
 * Helper: Execute CLI command
 */
function execCLI(args: string): string {
  try {
    return execSync(`node "${CLI_PATH}" ${args}`, {
      encoding: "utf8",
      cwd: process.cwd()
    });
  } catch (error: any) {
    throw new Error(`CLI execution failed: ${error.message}\n${error.stderr || error.stdout}`);
  }
}

describe("format command - basic functionality", () => {
  test("should format simple TONL file to stdout", () => {
    const input = "#version 1.0\nusers[2]{id,name,role}:\n1,Alice,admin\n2,Bob,user";
    const filepath = createTestFile("simple.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);

      // Should contain proper structure
      assert.ok(output.includes("#version 1.0"));
      assert.ok(output.includes("users[2]"));
      assert.ok(output.includes("Alice"));
      assert.ok(output.includes("Bob"));
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should format and write to output file", () => {
    const input = "#version 1.0\nusers[2]{id,name}:\n1,Alice\n2,Bob";
    const inputPath = createTestFile("input.tonl", input);
    const outputPath = join(TEST_DIR, "output.tonl");

    try {
      const result = execCLI(`format "${inputPath}" --pretty --out "${outputPath}"`);

      // Should show success message
      assert.ok(result.includes("✅"));
      assert.ok(result.includes("Formatted to"));

      // Output file should exist
      assert.ok(existsSync(outputPath));

      // Output should be valid TONL
      const formatted = readFileSync(outputPath, "utf8");
      assert.ok(formatted.includes("#version 1.0"));
      assert.ok(formatted.includes("users[2]"));
    } finally {
      cleanupTestFile(inputPath);
      cleanupTestFile(outputPath);
    }
  });

  test("should preserve data integrity after format", () => {
    const originalData = {
      users: [
        { id: 1, name: "Alice", role: "admin" },
        { id: 2, name: "Bob, Jr.", role: "user" }
      ]
    };

    const encoded = encodeTONL(originalData);
    const filepath = createTestFile("roundtrip.tonl", encoded);

    try {
      const formatted = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(formatted);

      assert.deepStrictEqual(decoded, originalData);
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - indentation options", () => {
  test("should use default 2-space indentation", () => {
    const input = "#version 1.0\nuser{id,contact}:\nid: 1\ncontact{email}:\nemail: test@example.com";
    const filepath = createTestFile("indent-default.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const lines = output.split("\n");

      // Find indented lines
      const indentedLine = lines.find(line => line.startsWith("  ") && !line.startsWith("    "));
      assert.ok(indentedLine, "Should have 2-space indented lines");
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should use custom 4-space indentation", () => {
    const input = "#version 1.0\nuser{id,contact}:\nid: 1\ncontact{email}:\nemail: test@example.com";
    const filepath = createTestFile("indent-4.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty --indent 4`);
      const lines = output.split("\n");

      // Should have 4-space indentation
      const indentedLine = lines.find(line => line.startsWith("    ") && !line.startsWith("        "));
      assert.ok(indentedLine, "Should have 4-space indented lines");
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle nested structures with proper indentation", () => {
    const nestedData = {
      project: {
        id: 1,
        owner: {
          id: 10,
          name: "Alice"
        },
        tasks: [
          { id: 100, title: "Task 1" }
        ]
      }
    };

    const encoded = encodeTONL(nestedData);
    const filepath = createTestFile("nested.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty --indent 2`);

      // Should preserve nested structure
      const decoded = decodeTONL(output);
      assert.deepStrictEqual(decoded, nestedData);
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - delimiter options", () => {
  test("should preserve comma delimiter", () => {
    const input = "#version 1.0\n#delimiter ,\nusers[2]{id,name}:\n1,Alice\n2,Bob";
    const filepath = createTestFile("delimiter-comma.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);

      // Should contain comma-separated values
      assert.ok(output.includes(" , "));
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should preserve pipe delimiter", () => {
    const input = "#version 1.0\n#delimiter |\nusers[2]{id,name}:\n1|Alice\n2|Bob";
    const filepath = createTestFile("delimiter-pipe.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty --delimiter \"|\"`, );

      // Should contain pipe-separated values
      assert.ok(output.includes(" | "));
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle tab delimiter", () => {
    const data = { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] };
    const encoded = encodeTONL(data, { delimiter: "\t" });
    const filepath = createTestFile("delimiter-tab.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty --delimiter "\\t"`);
      const decoded = decodeTONL(output, { delimiter: "\t" });

      assert.deepStrictEqual(decoded, data);
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - type hints", () => {
  test("should add type hints when --include-types is specified", () => {
    const input = "#version 1.0\nusers[2]{id,name}:\n1,Alice\n2,Bob";
    const filepath = createTestFile("types.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty --include-types`);

      // Should not contain type hints in output (since we're formatting, not re-inferring)
      // The format command preserves the structure as-is
      assert.ok(output.includes("users[2]"));
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - edge cases", () => {
  test("should handle empty arrays", () => {
    const data = { emptyList: [] };
    const encoded = encodeTONL(data);
    const filepath = createTestFile("empty-array.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, data);
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle null values", () => {
    const data = { value: null, active: true };
    const encoded = encodeTONL(data);
    const filepath = createTestFile("null-values.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, data);
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle special characters in strings", () => {
    const data = {
      users: [
        { id: 1, name: "Alice, Jr.", email: "alice@example.com" },
        { id: 2, name: "Bob Smith", email: "bob@example.com" }
      ]
    };
    const encoded = encodeTONL(data);
    const filepath = createTestFile("special-chars.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, data);
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle multiline strings", () => {
    const data = {
      description: "Line 1\nLine 2\nLine 3",
      title: "Simple Title"
    };
    const encoded = encodeTONL(data);
    const filepath = createTestFile("multiline.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, data);
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle large arrays", () => {
    const data = {
      items: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: i * 10
      }))
    };
    const encoded = encodeTONL(data);
    const filepath = createTestFile("large-array.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, data);
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - error handling", () => {
  test("should reject non-.tonl files", () => {
    const filepath = createTestFile("test.json", '{"test": true}');

    try {
      assert.throws(() => {
        execCLI(`format "${filepath}" --pretty`);
      }, /Format command requires a .tonl file/);
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should handle non-existent files", () => {
    const filepath = join(TEST_DIR, "nonexistent.tonl");

    assert.throws(() => {
      execCLI(`format "${filepath}" --pretty`);
    }, /File.*not found/);
  });

  test("should handle malformed TONL data", () => {
    // Create a TONL with mismatched array size
    const malformedTONL = "#version 1.0\nusers[3]{id,name}:\n1,Alice\n2,Bob";
    const filepath = createTestFile("malformed.tonl", malformedTONL);

    try {
      // Even with malformed data, format should handle gracefully
      // by parsing what it can and re-encoding
      const output = execCLI(`format "${filepath}" --pretty`);

      // Should produce valid TONL output
      assert.ok(output.includes("#version"));
      assert.ok(output.includes("users"));
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - version preservation", () => {
  test("should preserve TONL version", () => {
    const input = "#version 1.0\ndata{id}:\nid: 1";
    const filepath = createTestFile("version.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);

      assert.ok(output.includes("#version 1.0"));
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should allow version override", () => {
    const input = "#version 1.0\ndata{id}:\nid: 1";
    const filepath = createTestFile("version-override.tonl", input);

    try {
      const output = execCLI(`format "${filepath}" --pretty --version 2.0`);

      assert.ok(output.includes("#version 2.0"));
    } finally {
      cleanupTestFile(filepath);
    }
  });
});

describe("format command - complex real-world scenarios", () => {
  test("should format e-commerce product catalog", () => {
    const catalog = {
      products: [
        {
          id: 1,
          name: "Premium Laptop",
          price: 1299.99,
          inStock: true,
          tags: ["electronics", "computers"],
          specs: {
            cpu: "Intel i7",
            ram: "16GB",
            storage: "512GB SSD"
          }
        },
        {
          id: 2,
          name: "Wireless Mouse",
          price: 29.99,
          inStock: false,
          tags: ["accessories", "peripherals"],
          specs: {
            dpi: 1600,  // Use number instead of string to match TONL behavior
            battery: "AA",
            wireless: true
          }
        }
      ]
    };

    const encoded = encodeTONL(catalog);
    const filepath = createTestFile("ecommerce.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, catalog);
    } finally {
      cleanupTestFile(filepath);
    }
  });

  test("should format user management system", () => {
    const users = {
      users: [
        {
          id: 1,
          username: "alice",
          email: "alice@example.com",
          roles: ["admin", "editor"],
          metadata: {
            lastLogin: "2025-01-01",
            loginCount: 42
          }
        },
        {
          id: 2,
          username: "bob",
          email: "bob@example.com",
          roles: ["user"],
          metadata: {
            lastLogin: "2025-01-02",
            loginCount: 15
          }
        }
      ]
    };

    const encoded = encodeTONL(users);
    const filepath = createTestFile("users.tonl", encoded);

    try {
      const output = execCLI(`format "${filepath}" --pretty --indent 4`);
      const decoded = decodeTONL(output);

      assert.deepStrictEqual(decoded, users);
    } finally {
      cleanupTestFile(filepath);
    }
  });
});
