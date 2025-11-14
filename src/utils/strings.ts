/**
 * String utilities for TONL encoding/decoding
 */

import type { TONLDelimiter, TONLTypeHint } from "../types.js";

/**
 * Check if a value needs quoting based on TONL quoting rules
 */
export function needsQuoting(value: string, delimiter: TONLDelimiter): boolean {
  // Empty strings must be quoted to distinguish from missing values
  if (value === '') return true;

  // Quote boolean-like strings to distinguish from actual booleans
  if (value === 'true' || value === 'false') return true;

  // Quote null-like strings to distinguish from actual null
  if (value === 'null' || value === 'undefined') return true;

  // Quote special numeric strings to distinguish from actual Infinity/NaN
  if (value === 'Infinity' || value === '-Infinity' || value === 'NaN') return true;

  // Quote strings that look like numbers to prevent type confusion
  if (/^-?\d+$/.test(value)) return true;                          // Integer-like strings
  if (/^-?\d*\.\d+$/.test(value)) return true;                     // Decimal-like strings
  if (/^-?\d+\.?\d*e[+-]?\d+$/i.test(value)) return true;          // Scientific notation strings

  return value.includes(delimiter) ||
         value.includes(':') ||
         value.includes('{') ||
         value.includes('}') ||
         value.includes('#') ||
         value.includes('"') ||       // Quote characters need quoting
         value.includes('\n') ||
         value.includes('\t') ||      // Tab characters need quoting
         value.includes('\r') ||      // Carriage return needs quoting
         value.startsWith(' ') ||
         value.endsWith(' ');
}

/**
 * Quote a value if needed according to TONL rules
 */
export function quoteIfNeeded(value: string, delimiter: TONLDelimiter): string {
  if (needsQuoting(value, delimiter)) {
    // Escape backslashes first, then escape quotes with backslash
    // This avoids ambiguity with triple-quoted strings
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

/**
 * Unquote a value, handling backslash-escaped quotes and backslashes
 */
export function unquote(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    // Remove outer quotes and unescape backslash-escaped characters
    const inner = value.slice(1, -1);
    let result = '';
    let i = 0;
    while (i < inner.length) {
      if (inner[i] === '\\' && i + 1 < inner.length) {
        const nextChar = inner[i + 1];
        if (nextChar === '\\' || nextChar === '"') {
          result += nextChar;
          i += 2;
        } else {
          result += inner[i];
          i++;
        }
      } else {
        result += inner[i];
        i++;
      }
    }
    return result;
  }
  return value;
}

/**
 * Handle triple-quoted content
 */
export function tripleQuoteIfNeeded(value: string, delimiter: TONLDelimiter): string {
  if (value.includes('\n') || value.includes('"""')) {
    // For multi-line content, always use triple quotes
    // Escape backslashes, carriage returns, and triple quotes inside
    const escaped = value
      .replace(/\\/g, '\\\\')      // Escape backslashes first
      .replace(/\r/g, '\\r')       // Escape carriage returns to preserve them
      .replace(/"""/g, '\\"""');    // Escape triple quotes
    return `"""${escaped}"""`;
  }
  return quoteIfNeeded(value, delimiter);
}

/**
 * Create proper indentation string
 */
export function makeIndent(level: number, spaces: number): string {
  return " ".repeat(level * spaces);
}