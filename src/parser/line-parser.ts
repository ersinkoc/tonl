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

  // Handle special numeric values
  if (trimmed === "Infinity") {
    return Infinity;
  }

  if (trimmed === "-Infinity") {
    return -Infinity;
  }

  if (trimmed === "NaN") {
    return NaN;
  }

  // Handle triple-quoted strings FIRST (before single quotes)
  if (trimmed.startsWith('"""') && trimmed.endsWith('"""')) {
    return trimmed.slice(3, -3)
      .replace(/\\"""/g, '"""')   // Unescape triple quotes first
      .replace(/\\\\/g, '\\');     // Then unescape backslashes
  }

  // Handle quoted strings
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return unquote(trimmed);
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

  // Try to parse as scientific notation (e.g., 1.23e10, -4.56e-7)
  if (/^-?\d+\.?\d*e[+-]?\d+$/i.test(trimmed)) {
    const num = parseFloat(trimmed);
    return num;
  }

  // Default to string
  return trimmed;
}
