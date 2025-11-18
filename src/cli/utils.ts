/**
 * CLI Utility Functions
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { safeJsonParse } from "../utils/strings.js";
import { PathValidator } from "./path-validator.js";
import { SecurityError } from "../errors/index.js";

/**
 * Safe file read with path validation
 * BUG-008 FIX: Enhanced error handling and resource cleanup
 */
export function safeReadFile(userPath: string, preprocess: boolean = false): string {
  try {
    const safePath = PathValidator.validateRead(userPath);

    // BUG-008 FIX: Validate file existence and accessibility before reading
    if (!existsSync(safePath)) {
      throw new Error(`File not found: ${userPath}`);
    }

    // readFileSync in Node.js automatically handles file descriptor cleanup,
    // but we add explicit error context for better debugging
    let content = readFileSync(safePath, 'utf8');

    // Only preprocess if explicitly requested
    if (preprocess && userPath.endsWith('.json')) {
      content = preprocessJsonKeys(content);
    }

    return content;
  } catch (error) {
    if (error instanceof SecurityError) {
      console.error(`❌ Security Error: ${error.message}`);
      console.error(`❌ Access denied to: ${userPath}`);
      process.exit(1);
    }

    // BUG-008 FIX: Enhanced error reporting for file operation failures
    if (error instanceof Error) {
      console.error(`❌ Error reading file: ${error.message}`);
      console.error(`❌ File: ${userPath}`);
    } else {
      console.error(`❌ Unknown error reading file: ${userPath}`);
    }

    throw error;
  }
}

/**
 * Safe file write with path validation
 * BUG-008 FIX: Enhanced error handling and resource cleanup
 */
export function safeWriteFile(userPath: string, content: string): void {
  try {
    const safePath = PathValidator.validateWrite(userPath);

    // BUG-008 FIX: Validate content before writing
    if (typeof content !== 'string') {
      throw new Error(`Invalid content type: expected string, got ${typeof content}`);
    }

    // writeFileSync in Node.js automatically handles file descriptor cleanup,
    // but we add validation and enhanced error reporting
    writeFileSync(safePath, content, 'utf8');
  } catch (error) {
    if (error instanceof SecurityError) {
      console.error(`❌ Security Error: ${error.message}`);
      console.error(`❌ Cannot write to: ${userPath}`);
      process.exit(1);
    }

    // BUG-008 FIX: Enhanced error reporting for file operation failures
    if (error instanceof Error) {
      console.error(`❌ Error writing file: ${error.message}`);
      console.error(`❌ File: ${userPath}`);

      // Additional context for common write errors (Node.js system errors have code property)
      const nodeError = error as any;
      if (nodeError.code === 'EACCES') {
        console.error(`❌ Permission denied. Check file/directory permissions.`);
      } else if (nodeError.code === 'ENOSPC') {
        console.error(`❌ No space left on device.`);
      } else if (nodeError.code === 'EISDIR') {
        console.error(`❌ Target is a directory, not a file.`);
      }
    } else {
      console.error(`❌ Unknown error writing file: ${userPath}`);
    }

    throw error;
  }
}

/**
 * Preprocess JSON to handle special characters in keys
 * BUG-NEW-005 FIX: Transform problematic keys (like #, @) to safe alternatives
 * to prevent parsing conflicts with TONL directives and comments
 */
export function preprocessJsonKeys(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);

    // Transform problematic keys to safe alternatives
    const transformedData = transformObjectKeys(data);

    return JSON.stringify(transformedData, null, 2);
  } catch (error) {
    // If JSON parsing fails, try to fix common issues
    try {
      // Try to fix escaped characters
      const fixed = jsonString
        .replace(/\\"\\\\\#/g, '\\\\"hash\\\\"')
        .replace(/\\"\"\"/g, '\\\\"quote\\\\"');
      return JSON.parse(fixed);
    } catch {
      // If still fails, return original (will be caught by safeJsonParse)
      return jsonString;
    }
  }
}

/**
 * Transform object keys to safe alternatives
 */
function transformObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformObjectKeys);
  }

  if (obj !== null && typeof obj === 'object') {
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Transform problematic keys
      let safeKey = key;

      if (key === '#') {
        safeKey = 'hash_key';
      } else if (key === '') {
        safeKey = 'empty_key';
      } else if (key.includes('@')) {
        safeKey = key.replace(/@/g, '_at_');
      } else if (key.includes(':')) {
        safeKey = key.replace(/:/g, '_colon_');
      } else if (key.includes('"')) {
        safeKey = key.replace(/"/g, '_quote_');
      } else if (key.includes(' ')) {
        safeKey = key.replace(/ /g, '_space_');
      }

      transformed[safeKey] = transformObjectKeys(value);
    }
    return transformed;
  }

  return obj;
}

/**
 * Calculate byte size
 */
export function byteSize(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

/**
 * Display statistics
 */
export function displayStats(originalBytes: number, originalTokens: number, tonlBytes: number, tonlTokens: number, filename: string) {
  // BUGFIX: Handle division by zero case (empty files)
  const byteSavings = originalBytes > 0
    ? ((originalBytes - tonlBytes) / originalBytes * 100).toFixed(1)
    : '0.0';
  const tokenSavings = originalTokens > 0
    ? ((originalTokens - tonlTokens) / originalTokens * 100).toFixed(1)
    : '0.0';

  console.log(`\n📊 TONL Statistics for ${filename}`);
  console.log(`┌─────────────────┬─────────────┬─────────────┬────────────┐`);
  console.log(`│ Format          │ Bytes       │ Tokens      │ Savings    │`);
  console.log(`├─────────────────┼─────────────┼─────────────┼────────────┤`);
  console.log(`│ Original        │ ${originalBytes.toString().padStart(11)} │ ${originalTokens.toString().padStart(11)} │ ${"".padStart(10)} │`);
  console.log(`│ TONL           │ ${tonlBytes.toString().padStart(11)} │ ${tonlTokens.toString().padStart(11)} │ ${byteSavings.padStart(9)}% │`);
  console.log(`└─────────────────┴─────────────┴─────────────┴────────────┘`);
  console.log(`🎯 Byte reduction: ${byteSavings}% | 🧠 Token reduction: ${tokenSavings}%\n`);
}