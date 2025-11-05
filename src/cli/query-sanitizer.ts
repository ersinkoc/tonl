/**
 * Query Sanitizer - Query Injection Protection
 *
 * Validates and sanitizes query expressions to prevent injection attacks,
 * excessive resource usage, and other query-based exploits.
 */

import { SecurityError } from '../errors/index.js';

export interface QueryValidationOptions {
  /**
   * Maximum query length (default: 1000 characters)
   */
  maxLength?: number;

  /**
   * Maximum bracket/parenthesis nesting depth (default: 100)
   */
  maxDepth?: number;

  /**
   * Strip ANSI escape codes (default: true)
   */
  stripAnsiCodes?: boolean;
}

/**
 * Query expression sanitizer
 */
export class QuerySanitizer {
  /**
   * Sanitize and validate query expression
   *
   * @throws {SecurityError} if query is unsafe
   * @returns Sanitized query string
   */
  static sanitize(query: string, options?: QueryValidationOptions): string {
    const opts: Required<QueryValidationOptions> = {
      maxLength: options?.maxLength ?? 1000,
      maxDepth: options?.maxDepth ?? 100,
      stripAnsiCodes: options?.stripAnsiCodes ?? true,
    };

    // 1. Type validation
    if (typeof query !== 'string') {
      throw new SecurityError('Query must be string', {
        type: typeof query,
      });
    }

    // 2. Length validation
    if (query.length > opts.maxLength) {
      throw new SecurityError(
        `Query too long: ${query.length} characters (max: ${opts.maxLength})`,
        {
          length: query.length,
          maxLength: opts.maxLength,
        }
      );
    }

    // 3. Strip ANSI escape codes
    if (opts.stripAnsiCodes) {
      query = this.stripAnsiCodes(query);
    }

    // 4. Check for null bytes
    if (query.includes('\0')) {
      throw new SecurityError('Null bytes not allowed in query', {
        query: this.sanitizeForLogging(query),
      });
    }

    // 5. Check for dangerous patterns
    const dangerousPattern = this.findDangerousPattern(query);
    if (dangerousPattern) {
      throw new SecurityError(
        `Query contains forbidden pattern: ${dangerousPattern.description}`,
        {
          pattern: dangerousPattern.matched,
          description: dangerousPattern.description,
        }
      );
    }

    // 6. Validate bracket/parenthesis nesting
    const depth = this.getMaxNestingDepth(query);
    if (depth > opts.maxDepth) {
      throw new SecurityError(
        `Query nesting too deep: ${depth} levels (max: ${opts.maxDepth})`,
        {
          depth,
          maxDepth: opts.maxDepth,
        }
      );
    }

    // Query is safe
    return query.trim();
  }

  /**
   * Strip ANSI escape codes from string
   */
  private static stripAnsiCodes(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  }

  /**
   * Find dangerous patterns in query
   */
  private static findDangerousPattern(query: string): { matched: string; description: string } | null {
    const dangerousPatterns = [
      {
        regex: /require\s*\(/i,
        description: 'require() calls not allowed',
      },
      {
        regex: /import\s*\(/i,
        description: 'import() calls not allowed',
      },
      {
        regex: /eval\s*\(/i,
        description: 'eval() calls not allowed',
      },
      {
        regex: /exec\s*\(/i,
        description: 'exec() calls not allowed',
      },
      {
        regex: /Function\s*\(/i,
        description: 'Function() constructor not allowed',
      },
      {
        regex: /process\.env/i,
        description: 'Environment variable access not allowed',
      },
      {
        regex: /child_process/i,
        description: 'Child process access not allowed',
      },
      {
        regex: /fs\./i,
        description: 'File system access not allowed',
      },
      {
        regex: /\.\.\//,
        description: 'Directory traversal sequences not allowed',
      },
    ];

    for (const { regex, description } of dangerousPatterns) {
      const match = query.match(regex);
      if (match) {
        return {
          matched: match[0],
          description,
        };
      }
    }

    return null;
  }

  /**
   * Calculate maximum nesting depth of brackets/parentheses
   */
  private static getMaxNestingDepth(query: string): number {
    let depth = 0;
    let maxDepth = 0;

    for (const char of query) {
      if (char === '[' || char === '(' || char === '{') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === ']' || char === ')' || char === '}') {
        depth--;
      }
    }

    return maxDepth;
  }

  /**
   * Sanitize query for logging (truncate, remove sensitive data)
   */
  static sanitizeForLogging(query: string): string {
    // Truncate long queries
    if (query.length > 100) {
      query = query.substring(0, 97) + '...';
    }

    // Strip ANSI codes
    query = this.stripAnsiCodes(query);

    // Replace newlines with spaces
    query = query.replace(/[\r\n]+/g, ' ');

    return query;
  }
}
