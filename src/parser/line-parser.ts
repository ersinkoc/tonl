/**
 * Line-level parsing functions
 */

import type { TONLParseContext, TONLValue } from '../types.js';
import { unquote } from '../utils/strings.js';

/**
 * Parse a primitive value from a string
 * Handles null, undefined, booleans, numbers, and quoted/unquoted strings
 * @param value Raw string value
 * @param context Parse context
 * @returns Parsed primitive value
 */
export function parsePrimitiveValue(value: string, context: TONLParseContext): TONLValue {
  const trimmed = value.trim();

  if (trimmed === "null") {
    return null;
  }

  if (trimmed === "undefined") {
    return undefined;
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  // Handle quoted strings
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return unquote(trimmed);
  }

  // Handle triple-quoted strings
  if (trimmed.startsWith('"""') && trimmed.endsWith('"""')) {
    return trimmed.slice(3, -3).replace(/\\\\/g, '\\');
  }

  // Try to parse as number
  if (/^-?\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    return num;
  }

  if (/^-?\d*\.\d+$/.test(trimmed)) {
    const num = parseFloat(trimmed);
    return num;
  }

  // Default to string
  return trimmed;
}
