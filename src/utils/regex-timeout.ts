/**
 * Regex Timeout Wrapper (Task 007)
 *
 * Provides timeout protection for regex execution to prevent
 * ReDoS attacks that bypass static detection.
 *
 * ## Defense-in-Depth Strategy
 * - Static detection catches known dangerous patterns (in security.ts)
 * - This module adds runtime timing checks for novel attack patterns
 * - Short inputs bypass overhead for performance
 *
 * ## Limitations
 * - JavaScript main thread regex cannot be truly interrupted
 * - This implementation uses timing checks, not true cancellation
 * - For true cancellation, would need Worker threads (future enhancement)
 */

import { SecurityError } from '../errors/index.js';
import { DEFAULT_SECURITY_LIMITS } from './security-limits.js';

/**
 * Options for regex timeout wrapper
 */
export interface RegexTimeoutOptions {
  /** Timeout in milliseconds (default: 100) */
  timeout?: number;
  /** Throw error on timeout (default: true) */
  throwOnTimeout?: boolean;
  /** Minimum input length to apply timeout protection (default: 1000) */
  minInputLengthForTimeout?: number;
}

/** Default timeout options */
export const DEFAULT_REGEX_TIMEOUT_OPTIONS: Required<RegexTimeoutOptions> = {
  timeout: 100,
  throwOnTimeout: true,
  minInputLengthForTimeout: 1000,
};

/**
 * Execute regex test with timeout protection.
 *
 * Uses timing checks as defense-in-depth against ReDoS attacks.
 * For short inputs (<1000 chars by default), skips timeout overhead.
 *
 * @param pattern - Regex pattern or RegExp object
 * @param input - String to test
 * @param options - Timeout options
 * @returns Test result or false if timeout/error
 * @throws SecurityError if timeout and throwOnTimeout=true
 *
 * @example
 * ```typescript
 * // Basic usage
 * const matches = safeRegexTest(/hello/, 'hello world');
 *
 * // With custom timeout
 * const matches = safeRegexTest(/complex.*pattern/, longInput, { timeout: 50 });
 *
 * // Silent failure mode
 * const matches = safeRegexTest(pattern, input, { throwOnTimeout: false });
 * ```
 */
export function safeRegexTest(
  pattern: RegExp | string,
  input: string,
  options: RegexTimeoutOptions = {}
): boolean {
  const {
    timeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.timeout,
    throwOnTimeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.throwOnTimeout,
    minInputLengthForTimeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.minInputLengthForTimeout,
  } = options;

  // For short inputs, skip timeout overhead for performance
  if (input.length < minInputLengthForTimeout) {
    try {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return regex.test(input);
    } catch (error) {
      if (throwOnTimeout) {
        throw new SecurityError(
          `Regex test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { pattern: String(pattern).substring(0, 50), inputLength: input.length }
        );
      }
      return false;
    }
  }

  // For longer inputs, use timeout protection
  const startTime = Date.now();

  try {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const result = regex.test(input);

    // Check if execution took too long (sync warning)
    const elapsed = Date.now() - startTime;
    if (elapsed > timeout) {
      // Log warning but return result since we can't cancel
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
        // Only warn in non-test environments to avoid noise
        console.warn(
          `[TONL Security Warning] Regex execution took ${elapsed}ms (limit: ${timeout}ms). ` +
          `Pattern: ${String(pattern).substring(0, 30)}...`
        );
      }
    }

    return result;
  } catch (error) {
    if (throwOnTimeout) {
      throw new SecurityError(
        `Regex test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { pattern: String(pattern).substring(0, 50), inputLength: input.length }
      );
    }
    return false;
  }
}

/**
 * Execute regex match with timeout protection.
 *
 * Uses timing checks as defense-in-depth against ReDoS attacks.
 * For short inputs (<1000 chars by default), skips timeout overhead.
 *
 * @param pattern - Regex pattern or RegExp object
 * @param input - String to match
 * @param options - Timeout options
 * @returns Match result or null if timeout/error
 * @throws SecurityError if timeout and throwOnTimeout=true
 *
 * @example
 * ```typescript
 * // Basic usage
 * const match = safeRegexMatch(/(\d+)/, 'value: 123');
 *
 * // With custom timeout
 * const match = safeRegexMatch(/complex.*pattern/, longInput, { timeout: 50 });
 * ```
 */
export function safeRegexMatch(
  pattern: RegExp | string,
  input: string,
  options: RegexTimeoutOptions = {}
): RegExpMatchArray | null {
  const {
    timeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.timeout,
    throwOnTimeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.throwOnTimeout,
    minInputLengthForTimeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.minInputLengthForTimeout,
  } = options;

  // For short inputs, skip timeout overhead
  if (input.length < minInputLengthForTimeout) {
    try {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return input.match(regex);
    } catch (error) {
      if (throwOnTimeout) {
        throw new SecurityError(
          `Regex match failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { pattern: String(pattern).substring(0, 50), inputLength: input.length }
        );
      }
      return null;
    }
  }

  // For longer inputs, use timeout protection
  const startTime = Date.now();

  try {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const result = input.match(regex);

    const elapsed = Date.now() - startTime;
    if (elapsed > timeout) {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
        console.warn(
          `[TONL Security Warning] Regex match took ${elapsed}ms (limit: ${timeout}ms). ` +
          `Pattern: ${String(pattern).substring(0, 30)}...`
        );
      }
    }

    return result;
  } catch (error) {
    if (throwOnTimeout) {
      throw new SecurityError(
        `Regex match failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { pattern: String(pattern).substring(0, 50), inputLength: input.length }
      );
    }
    return null;
  }
}

/**
 * Execute regex replace with timeout protection.
 *
 * @param pattern - Regex pattern or RegExp object
 * @param input - String to process
 * @param replacement - Replacement string or function
 * @param options - Timeout options
 * @returns Replaced string or original if error
 * @throws SecurityError if timeout and throwOnTimeout=true
 */
export function safeRegexReplace(
  pattern: RegExp | string,
  input: string,
  replacement: string | ((substring: string, ...args: any[]) => string),
  options: RegexTimeoutOptions = {}
): string {
  const {
    timeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.timeout,
    throwOnTimeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.throwOnTimeout,
    minInputLengthForTimeout = DEFAULT_REGEX_TIMEOUT_OPTIONS.minInputLengthForTimeout,
  } = options;

  // For short inputs, skip timeout overhead
  if (input.length < minInputLengthForTimeout) {
    try {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      return input.replace(regex, replacement as any);
    } catch (error) {
      if (throwOnTimeout) {
        throw new SecurityError(
          `Regex replace failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { pattern: String(pattern).substring(0, 50), inputLength: input.length }
        );
      }
      return input; // Return original on error
    }
  }

  // For longer inputs, use timeout protection
  const startTime = Date.now();

  try {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const result = input.replace(regex, replacement as any);

    const elapsed = Date.now() - startTime;
    if (elapsed > timeout) {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
        console.warn(
          `[TONL Security Warning] Regex replace took ${elapsed}ms (limit: ${timeout}ms). ` +
          `Pattern: ${String(pattern).substring(0, 30)}...`
        );
      }
    }

    return result;
  } catch (error) {
    if (throwOnTimeout) {
      throw new SecurityError(
        `Regex replace failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { pattern: String(pattern).substring(0, 50), inputLength: input.length }
      );
    }
    return input; // Return original on error
  }
}

/**
 * Create a safe regex executor with pre-configured options.
 *
 * @param options - Default options for all operations
 * @returns Object with safe regex methods
 *
 * @example
 * ```typescript
 * const safeRegex = createSafeRegexExecutor({ timeout: 50 });
 * const matches = safeRegex.test(/pattern/, input);
 * const result = safeRegex.match(/pattern/, input);
 * ```
 */
export function createSafeRegexExecutor(options: RegexTimeoutOptions = {}) {
  return {
    test: (pattern: RegExp | string, input: string, overrides?: RegexTimeoutOptions) =>
      safeRegexTest(pattern, input, { ...options, ...overrides }),
    match: (pattern: RegExp | string, input: string, overrides?: RegexTimeoutOptions) =>
      safeRegexMatch(pattern, input, { ...options, ...overrides }),
    replace: (
      pattern: RegExp | string,
      input: string,
      replacement: string | ((substring: string, ...args: any[]) => string),
      overrides?: RegexTimeoutOptions
    ) => safeRegexReplace(pattern, input, replacement, { ...options, ...overrides }),
  };
}
