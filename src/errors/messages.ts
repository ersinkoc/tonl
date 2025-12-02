/**
 * Error Message Templates (Task 014)
 *
 * Centralized error message templates for consistent formatting across TONL.
 *
 * ## Style Guide
 * - Format: "{Operation} failed: {reason}. {context}"
 * - First word capitalized, rest lowercase unless proper noun
 * - Use single quotes for values: 'value'
 * - Use backticks for code: `code`
 * - Include relevant context in parentheses: (expected: X, got: Y)
 */

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Error message templates for consistent formatting
 */
export const ErrorMessages = {
  // ========================================
  // Parse Errors
  // ========================================

  UNEXPECTED_TOKEN: (token: string, line: number, col?: number) =>
    col !== undefined
      ? `Unexpected token '${token}' at line ${line}, column ${col}`
      : `Unexpected token '${token}' at line ${line}`,

  INVALID_HEADER: (header: string) =>
    `Invalid header format: '${header}'`,

  UNCLOSED_QUOTE: (line: number) =>
    `Unclosed quote starting at line ${line}`,

  INVALID_DELIMITER: (delimiter: string) =>
    `Invalid delimiter: '${delimiter}'. Valid delimiters are: , | \\t ;`,

  MALFORMED_LINE: (line: number, content: string) =>
    `Malformed line ${line}: '${content.substring(0, 50)}${content.length > 50 ? '...' : ''}'`,

  // ========================================
  // Type Errors
  // ========================================

  TYPE_MISMATCH: (expected: string, actual: string, path?: string) =>
    path
      ? `Expected ${expected} but got ${actual} at path '${path}'`
      : `Expected ${expected} but got ${actual}`,

  INVALID_INDEX: (index: number, length: number) =>
    `Array index ${index} out of bounds (length: ${length})`,

  NOT_AN_ARRAY: (path: string) =>
    `Value at path '${path}' is not an array`,

  NOT_AN_OBJECT: (path: string) =>
    `Value at path '${path}' is not an object`,

  // ========================================
  // Security Errors
  // ========================================

  PROTOTYPE_POLLUTION: (property: string) =>
    `Access to '${property}' is forbidden (prototype pollution protection)`,

  PATH_TRAVERSAL: (path: string) =>
    `Path traversal detected in '${path}'`,

  REGEX_TOO_LONG: (length: number, max: number) =>
    `Regex pattern too long: ${length} characters (max: ${max})`,

  REGEX_TOO_COMPLEX: (depth: number, max: number) =>
    `Regex nesting too deep: ${depth} levels (max: ${max})`,

  DANGEROUS_REGEX: (pattern: string) =>
    `Dangerous regex pattern detected: '${pattern}'`,

  // ========================================
  // Resource Limit Errors
  // ========================================

  INPUT_TOO_LARGE: (size: number, max: number) =>
    `Input too large: ${formatBytes(size)} (max: ${formatBytes(max)})`,

  LINE_TOO_LONG: (length: number, max: number, line?: number) =>
    line !== undefined
      ? `Line ${line} exceeds maximum length: ${length} characters (max: ${max})`
      : `Line exceeds maximum length: ${length} characters (max: ${max})`,

  DEPTH_EXCEEDED: (depth: number, max: number, key?: string) =>
    key
      ? `Maximum nesting depth exceeded (${max}) at key: '${key}'`
      : `Maximum nesting depth exceeded: ${depth} (max: ${max})`,

  BLOCK_LINES_EXCEEDED: (lines: number, max: number) =>
    `Maximum block lines exceeded (${max}). Block has ${lines} lines`,

  BUFFER_OVERFLOW: (current: number, incoming: number, max: number) =>
    `Buffer overflow prevented: incoming chunk would exceed ${formatBytes(max)}. Current buffer: ${formatBytes(current)}, chunk: ${formatBytes(incoming)}`,

  // ========================================
  // Circular Reference Errors
  // ========================================

  CIRCULAR_REFERENCE: (key: string) =>
    `Circular reference detected at key: '${key}'`,

  SELF_REFERENCE: (key: string, property?: string) =>
    property
      ? `Self-reference detected at key: '${key}.${property}'`
      : `Self-reference detected at key: '${key}'`,

  // ========================================
  // Query Errors
  // ========================================

  INVALID_PATH: (path: string, reason: string) =>
    `Invalid path '${path}': ${reason}`,

  FILTER_SYNTAX: (filter: string, position?: number) =>
    position !== undefined
      ? `Invalid filter syntax in '${filter}' at position ${position}`
      : `Invalid filter syntax in '${filter}'`,

  QUERY_TOO_DEEP: (depth: number, max: number) =>
    `Query nesting too deep: ${depth} levels (max: ${max})`,

  // ========================================
  // Schema Validation Errors
  // ========================================

  SCHEMA_VIOLATION: (field: string, constraint: string, value: string) =>
    `Schema violation at '${field}': ${constraint} (got: '${value}')`,

  REQUIRED_FIELD: (field: string) =>
    `Required field '${field}' is missing`,

  INVALID_ENUM: (field: string, value: string, allowed: string[]) =>
    `Invalid value '${value}' for field '${field}'. Allowed values: ${allowed.join(', ')}`,

  PATTERN_MISMATCH: (field: string, pattern: string) =>
    `Value at '${field}' does not match pattern: ${pattern}`,

  // ========================================
  // File Errors
  // ========================================

  FILE_NOT_FOUND: (path: string) =>
    `File not found: '${path}'`,

  FILE_LOCKED: (path: string) =>
    `File is locked by another process: '${path}'`,

  BACKUP_NOT_FOUND: (path: string) =>
    `Backup file not found: '${path}'`,

  // ========================================
  // General Errors
  // ========================================

  OPERATION_FAILED: (operation: string, reason: string) =>
    `${operation} failed: ${reason}`,

  NOT_IMPLEMENTED: (feature: string) =>
    `Feature not implemented: '${feature}'`,
} as const;

/**
 * Type for error message keys
 */
export type ErrorMessageKey = keyof typeof ErrorMessages;
