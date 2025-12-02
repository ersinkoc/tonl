/**
 * CLI Input Validation Utilities
 *
 * Provides unified validation for all CLI commands.
 * Complements PathValidator with option-level validation.
 */

import { PathValidator } from './path-validator.js';
import { SecurityError } from '../errors/index.js';

/**
 * Validation result structure
 */
export interface ValidationResult<T = string> {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Sanitized/normalized value */
  value?: T;
}

/**
 * Validate and sanitize input file path
 *
 * @param path - User-provided file path
 * @param required - Whether the path is required
 * @returns Validation result with sanitized path
 */
export function validateInputPath(
  path: string | undefined,
  required: boolean = true
): ValidationResult {
  if (!path) {
    if (required) {
      return { valid: false, error: 'Input file path is required' };
    }
    return { valid: true };
  }

  try {
    const sanitized = PathValidator.validateRead(path);
    return { valid: true, value: sanitized };
  } catch (error) {
    if (error instanceof SecurityError) {
      return { valid: false, error: `Security error: ${error.message}` };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid path'
    };
  }
}

/**
 * Validate output file path
 *
 * @param path - User-provided output path
 * @param required - Whether the path is required
 * @returns Validation result with sanitized path
 */
export function validateOutputPath(
  path: string | undefined,
  required: boolean = false
): ValidationResult {
  if (!path) {
    if (required) {
      return { valid: false, error: 'Output file path is required' };
    }
    return { valid: true };
  }

  try {
    const sanitized = PathValidator.validateWrite(path);
    return { valid: true, value: sanitized };
  } catch (error) {
    if (error instanceof SecurityError) {
      return { valid: false, error: `Security error: ${error.message}` };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid output path'
    };
  }
}

/**
 * Valid delimiters and their aliases
 */
const DELIMITER_MAP: Record<string, string> = {
  'comma': ',',
  'pipe': '|',
  'tab': '\t',
  'semicolon': ';',
  ',': ',',
  '|': '|',
  '\t': '\t',
  ';': ';'
};

const VALID_DELIMITERS = [',', '|', '\t', ';'];

/**
 * Validate delimiter option
 *
 * @param delimiter - User-provided delimiter
 * @returns Validation result with normalized delimiter
 */
export function validateDelimiter(
  delimiter: string | undefined
): ValidationResult {
  if (!delimiter) {
    return { valid: true, value: ',' }; // Default to comma
  }

  const normalized = delimiter.toLowerCase();
  const mapped = DELIMITER_MAP[normalized];

  if (mapped && VALID_DELIMITERS.includes(mapped)) {
    return { valid: true, value: mapped };
  }

  return {
    valid: false,
    error: `Invalid delimiter '${delimiter}'. Valid options: comma (,), pipe (|), tab, semicolon (;)`
  };
}

/**
 * Valid tokenizer models
 */
const VALID_TOKENIZERS = [
  'gpt-5', 'gpt-4.5', 'gpt-4o',
  'claude-3.5',
  'gemini-2.0',
  'llama-4',
  'o200k', 'cl100k'
];

/**
 * Validate tokenizer option
 *
 * @param tokenizer - User-provided tokenizer name
 * @returns Validation result with validated tokenizer
 */
export function validateTokenizer(
  tokenizer: string | undefined
): ValidationResult {
  if (!tokenizer) {
    return { valid: true, value: 'cl100k' }; // Default tokenizer
  }

  const normalized = tokenizer.toLowerCase();
  if (VALID_TOKENIZERS.includes(normalized)) {
    return { valid: true, value: normalized };
  }

  return {
    valid: false,
    error: `Invalid tokenizer '${tokenizer}'. Valid options: ${VALID_TOKENIZERS.join(', ')}`
  };
}

/**
 * Validate numeric option
 *
 * @param value - User-provided value
 * @param options - Validation options
 * @returns Validation result with validated number
 */
export function validateNumber(
  value: string | number | undefined,
  options: {
    name: string;
    min?: number;
    max?: number;
    default?: number;
    integer?: boolean;
  }
): ValidationResult<number> {
  if (value === undefined || value === '') {
    if (options.default !== undefined) {
      return { valid: true, value: options.default };
    }
    return { valid: true };
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return {
      valid: false,
      error: `${options.name} must be a number, got '${value}'`
    };
  }

  if (options.integer && !Number.isInteger(num)) {
    return {
      valid: false,
      error: `${options.name} must be an integer, got '${value}'`
    };
  }

  if (options.min !== undefined && num < options.min) {
    return {
      valid: false,
      error: `${options.name} must be at least ${options.min}, got ${num}`
    };
  }

  if (options.max !== undefined && num > options.max) {
    return {
      valid: false,
      error: `${options.name} must be at most ${options.max}, got ${num}`
    };
  }

  return { valid: true, value: num };
}

/**
 * Validate indent option
 *
 * @param indent - User-provided indent value
 * @returns Validation result with validated indent
 */
export function validateIndent(
  indent: string | number | undefined
): ValidationResult<number> {
  return validateNumber(indent, {
    name: 'Indent',
    min: 0,
    max: 8,
    default: 2,
    integer: true
  });
}

/**
 * Validate version string
 *
 * @param version - User-provided version
 * @returns Validation result
 */
export function validateVersion(
  version: string | undefined
): ValidationResult {
  if (!version) {
    return { valid: true }; // Version is optional
  }

  // Simple semver-like pattern: major.minor or major.minor.patch
  const versionPattern = /^\d+\.\d+(\.\d+)?$/;
  if (versionPattern.test(version)) {
    return { valid: true, value: version };
  }

  return {
    valid: false,
    error: `Invalid version format '${version}'. Expected format: X.Y or X.Y.Z`
  };
}

/**
 * Collected validation errors
 */
export interface ValidationErrors {
  valid: boolean;
  errors: string[];
}

/**
 * Run all validations and collect errors
 *
 * @param validations - Array of validation results
 * @returns Combined result with all errors
 */
export function validateAll(
  validations: ValidationResult<unknown>[]
): ValidationErrors {
  const errors = validations
    .filter(v => !v.valid && v.error)
    .map(v => v.error!);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Display validation errors to console
 *
 * @param errors - Array of error messages
 * @param exitCode - Process exit code (default: 1)
 */
export function displayValidationErrors(
  errors: string[],
  exitCode: number = 1
): never {
  console.error('❌ Validation errors:');
  errors.forEach(e => console.error(`   • ${e}`));
  process.exit(exitCode);
}

/**
 * Validate query expression
 *
 * @param expression - Query expression string
 * @returns Validation result
 */
export function validateQueryExpression(
  expression: string | undefined
): ValidationResult {
  if (!expression) {
    return { valid: false, error: 'Query expression is required' };
  }

  // Check for potentially dangerous patterns
  if (expression.includes('__proto__') ||
      expression.includes('constructor') ||
      expression.includes('prototype')) {
    return {
      valid: false,
      error: 'Query expression contains blocked property access patterns'
    };
  }

  // Basic length limit
  if (expression.length > 1000) {
    return {
      valid: false,
      error: 'Query expression exceeds maximum length (1000 characters)'
    };
  }

  return { valid: true, value: expression };
}
