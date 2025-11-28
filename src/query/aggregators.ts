/**
 * Aggregation Functions for TONL Query API
 *
 * Provides aggregation capabilities like count, sum, avg, min, max, groupBy
 * for use with query results.
 *
 * @example
 * ```typescript
 * const users = doc.query("users[*]");
 * const result = aggregate(users)
 *   .count()                    // 42
 *   .sum("age")                 // 1250
 *   .avg("age")                 // 29.76
 *   .groupBy("country")         // { TR: [...], US: [...] }
 * ```
 */

/**
 * Options for aggregation operations
 */
export interface AggregationOptions {
  /**
   * Whether to ignore null/undefined values in calculations
   * @default true
   */
  ignoreNull?: boolean;

  /**
   * Whether to treat non-numeric values as 0 in numeric aggregations
   * @default false
   */
  coerceNumbers?: boolean;

  /**
   * Custom comparator for min/max operations
   */
  comparator?: (a: any, b: any) => number;
}

/**
 * Result wrapper for aggregation operations
 * Provides a fluent interface for chaining aggregations
 */
export class AggregationResult<T> {
  private items: T[];
  private options: AggregationOptions;

  constructor(items: T[], options: AggregationOptions = {}) {
    this.items = Array.isArray(items) ? items : [];
    this.options = {
      ignoreNull: true,
      coerceNumbers: false,
      ...options
    };
  }

  /**
   * Get the underlying items array
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Count the number of items
   *
   * @example
   * ```typescript
   * aggregate(users).count()  // 42
   * ```
   */
  count(): number {
    return this.items.length;
  }

  /**
   * Sum numeric values
   *
   * @param field - Optional field name for object arrays
   * @returns Sum of values
   *
   * @example
   * ```typescript
   * aggregate([1, 2, 3]).sum()           // 6
   * aggregate(orders).sum("total")       // 1500.50
   * ```
   */
  sum(field?: string): number {
    const values = this.extractNumericValues(field);
    return values.reduce((acc, val) => acc + val, 0);
  }

  /**
   * Calculate average of numeric values
   *
   * @param field - Optional field name for object arrays
   * @returns Average value or NaN if empty
   *
   * @example
   * ```typescript
   * aggregate([1, 2, 3]).avg()           // 2
   * aggregate(products).avg("price")     // 29.99
   * ```
   */
  avg(field?: string): number {
    const values = this.extractNumericValues(field);
    if (values.length === 0) return NaN;
    return this.sum(field) / values.length;
  }

  /**
   * Find minimum value
   *
   * @param field - Optional field name for object arrays
   * @returns Minimum value or undefined if empty
   *
   * @example
   * ```typescript
   * aggregate([3, 1, 2]).min()           // 1
   * aggregate(products).min("price")     // 9.99
   * ```
   */
  min(field?: string): T | number | undefined {
    if (this.items.length === 0) return undefined;

    const values = field ? this.extractValues(field) : this.items;
    const validValues = values.filter(v => v !== null && v !== undefined);

    if (validValues.length === 0) return undefined;

    const comparator = this.options.comparator || ((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      return String(a).localeCompare(String(b));
    });

    return validValues.reduce((min, val) =>
      comparator(val, min) < 0 ? val : min
    );
  }

  /**
   * Find maximum value
   *
   * @param field - Optional field name for object arrays
   * @returns Maximum value or undefined if empty
   *
   * @example
   * ```typescript
   * aggregate([1, 3, 2]).max()           // 3
   * aggregate(products).max("price")     // 99.99
   * ```
   */
  max(field?: string): T | number | undefined {
    if (this.items.length === 0) return undefined;

    const values = field ? this.extractValues(field) : this.items;
    const validValues = values.filter(v => v !== null && v !== undefined);

    if (validValues.length === 0) return undefined;

    const comparator = this.options.comparator || ((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      return String(a).localeCompare(String(b));
    });

    return validValues.reduce((max, val) =>
      comparator(val, max) > 0 ? val : max
    );
  }

  /**
   * Group items by a field value
   *
   * @param field - Field name to group by
   * @returns Object with group keys and arrays of items
   *
   * @example
   * ```typescript
   * aggregate(users).groupBy("country")
   * // { "TR": [user1, user2], "US": [user3] }
   *
   * aggregate(orders).groupBy("status")
   * // { "pending": [...], "completed": [...] }
   * ```
   */
  groupBy<K extends string>(field: K): Record<string, T[]> {
    const groups: Record<string, T[]> = {};

    for (const item of this.items) {
      const key = this.getFieldValue(item, field);
      const groupKey = key === null || key === undefined ? '__null__' : String(key);

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    }

    return groups;
  }

  /**
   * Get distinct values
   *
   * @param field - Optional field name for object arrays
   * @returns Array of unique values
   *
   * @example
   * ```typescript
   * aggregate([1, 2, 2, 3, 3, 3]).distinct()  // [1, 2, 3]
   * aggregate(users).distinct("country")      // ["TR", "US", "DE"]
   * ```
   */
  distinct(field?: string): any[] {
    const values = field ? this.extractValues(field) : this.items;
    const seen = new Set<any>();
    const result: any[] = [];

    for (const val of values) {
      // Use JSON.stringify for object comparison
      const key = typeof val === 'object' && val !== null
        ? JSON.stringify(val)
        : val;

      if (!seen.has(key)) {
        seen.add(key);
        result.push(val);
      }
    }

    return result;
  }

  /**
   * Get first item
   *
   * @returns First item or undefined
   */
  first(): T | undefined {
    return this.items[0];
  }

  /**
   * Get last item
   *
   * @returns Last item or undefined
   */
  last(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Get item at specific index
   *
   * @param index - Array index (supports negative for end-relative)
   * @returns Item at index or undefined
   */
  at(index: number): T | undefined {
    if (index < 0) {
      index = this.items.length + index;
    }
    return this.items[index];
  }

  /**
   * Take first N items
   *
   * @param n - Number of items to take
   * @returns New AggregationResult with first N items
   */
  take(n: number): AggregationResult<T> {
    return new AggregationResult(this.items.slice(0, n), this.options);
  }

  /**
   * Skip first N items
   *
   * @param n - Number of items to skip
   * @returns New AggregationResult without first N items
   */
  skip(n: number): AggregationResult<T> {
    return new AggregationResult(this.items.slice(n), this.options);
  }

  /**
   * Sort items
   *
   * @param field - Field name to sort by
   * @param order - Sort order ('asc' or 'desc')
   * @returns New sorted AggregationResult
   *
   * @example
   * ```typescript
   * aggregate(users).orderBy("age")            // ascending
   * aggregate(users).orderBy("age", "desc")    // descending
   * ```
   */
  orderBy(field: string, order: 'asc' | 'desc' = 'asc'): AggregationResult<T> {
    const sorted = [...this.items].sort((a, b) => {
      const valA = this.getFieldValue(a, field);
      const valB = this.getFieldValue(b, field);

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA === null || valA === undefined) {
        comparison = 1;
      } else if (valB === null || valB === undefined) {
        comparison = -1;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return new AggregationResult(sorted, this.options);
  }

  /**
   * Filter items
   *
   * @param predicate - Filter function
   * @returns New filtered AggregationResult
   */
  filter(predicate: (item: T, index: number) => boolean): AggregationResult<T> {
    return new AggregationResult(
      this.items.filter(predicate),
      this.options
    );
  }

  /**
   * Map items to new values
   *
   * @param mapper - Transform function
   * @returns New AggregationResult with mapped items
   */
  map<U>(mapper: (item: T, index: number) => U): AggregationResult<U> {
    return new AggregationResult(
      this.items.map(mapper),
      this.options
    );
  }

  /**
   * Reduce items to single value
   *
   * @param reducer - Reducer function
   * @param initial - Initial value
   * @returns Reduced value
   */
  reduce<U>(reducer: (acc: U, item: T, index: number) => U, initial: U): U {
    return this.items.reduce(reducer, initial);
  }

  /**
   * Check if any item matches predicate
   *
   * @param predicate - Test function
   * @returns True if any item matches
   */
  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  /**
   * Check if all items match predicate
   *
   * @param predicate - Test function
   * @returns True if all items match
   */
  every(predicate: (item: T) => boolean): boolean {
    return this.items.every(predicate);
  }

  /**
   * Calculate statistics for numeric field
   *
   * @param field - Optional field name
   * @returns Statistics object
   */
  stats(field?: string): {
    count: number;
    sum: number;
    avg: number;
    min: number | undefined;
    max: number | undefined;
    variance: number;
    stdDev: number;
  } {
    const values = this.extractNumericValues(field);
    const count = values.length;

    if (count === 0) {
      return {
        count: 0,
        sum: 0,
        avg: NaN,
        min: undefined,
        max: undefined,
        variance: NaN,
        stdDev: NaN
      };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate variance
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / count;
    const stdDev = Math.sqrt(variance);

    return { count, sum, avg, min, max, variance, stdDev };
  }

  /**
   * Partition items into groups based on predicate
   *
   * @param predicate - Test function
   * @returns Tuple of [matching, nonMatching] arrays
   */
  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const matching: T[] = [];
    const nonMatching: T[] = [];

    for (const item of this.items) {
      if (predicate(item)) {
        matching.push(item);
      } else {
        nonMatching.push(item);
      }
    }

    return [matching, nonMatching];
  }

  /**
   * Flatten nested arrays
   *
   * @param depth - Maximum depth to flatten (default: 1)
   * @returns Flattened AggregationResult
   */
  flatten(depth: number = 1): AggregationResult<any> {
    const result: any[] = [];

    const flattenRecursive = (arr: any[], currentDepth: number) => {
      for (const item of arr) {
        if (Array.isArray(item) && currentDepth < depth) {
          flattenRecursive(item, currentDepth + 1);
        } else {
          result.push(item);
        }
      }
    };

    flattenRecursive(this.items, 0);
    return new AggregationResult(result, this.options);
  }

  /**
   * Get frequency count for values
   *
   * @param field - Optional field name
   * @returns Object with values and their counts
   */
  frequency(field?: string): Record<string, number> {
    const values = field ? this.extractValues(field) : this.items;
    const freq: Record<string, number> = {};

    for (const val of values) {
      const key = val === null || val === undefined
        ? '__null__'
        : typeof val === 'object'
          ? JSON.stringify(val)
          : String(val);

      freq[key] = (freq[key] || 0) + 1;
    }

    return freq;
  }

  /**
   * Calculate percentile value
   *
   * @param percentile - Percentile (0-100)
   * @param field - Optional field name
   * @returns Percentile value
   */
  percentile(percentile: number, field?: string): number | undefined {
    const values = this.extractNumericValues(field).sort((a, b) => a - b);

    if (values.length === 0) return undefined;
    if (percentile <= 0) return values[0];
    if (percentile >= 100) return values[values.length - 1];

    const index = (percentile / 100) * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) return values[lower];

    return values[lower] * (1 - weight) + values[upper] * weight;
  }

  /**
   * Calculate median value
   *
   * @param field - Optional field name
   * @returns Median value
   */
  median(field?: string): number | undefined {
    return this.percentile(50, field);
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  /**
   * Extract a field value from an item
   */
  private getFieldValue(item: any, field: string): any {
    if (item === null || item === undefined) return undefined;

    // Handle dot notation for nested fields
    const parts = field.split('.');
    let current = item;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = current[part];
    }

    return current;
  }

  /**
   * Extract values from items (with optional field)
   */
  private extractValues(field?: string): any[] {
    if (!field) return [...this.items];

    return this.items.map(item => this.getFieldValue(item, field));
  }

  /**
   * Extract numeric values from items
   */
  private extractNumericValues(field?: string): number[] {
    const values = this.extractValues(field);
    const result: number[] = [];

    for (const val of values) {
      if (typeof val === 'number' && Number.isFinite(val)) {
        result.push(val);
      } else if (this.options.coerceNumbers && val !== null && val !== undefined) {
        const num = Number(val);
        if (Number.isFinite(num)) {
          result.push(num);
        }
      } else if (!this.options.ignoreNull && (val === null || val === undefined)) {
        result.push(0);
      }
    }

    return result;
  }
}

// ========================================
// Factory Functions
// ========================================

/**
 * Create an aggregation wrapper for query results
 *
 * @param items - Array of items to aggregate
 * @param options - Aggregation options
 * @returns AggregationResult instance
 *
 * @example
 * ```typescript
 * const users = doc.query("users[*]");
 *
 * // Count
 * aggregate(users).count()  // 42
 *
 * // Sum a field
 * aggregate(orders).sum("total")  // 15420.50
 *
 * // Average
 * aggregate(products).avg("price")  // 29.99
 *
 * // Group by
 * aggregate(users).groupBy("country")
 * // { "TR": [...], "US": [...] }
 *
 * // Chained operations
 * aggregate(users)
 *   .filter(u => u.active)
 *   .orderBy("age", "desc")
 *   .take(10)
 *   .toArray()
 * ```
 */
export function aggregate<T>(
  items: T[],
  options?: AggregationOptions
): AggregationResult<T> {
  return new AggregationResult(items, options);
}

/**
 * Shorthand aggregation functions for quick operations
 */
export const agg = {
  /**
   * Count items in array
   */
  count: <T>(items: T[]): number => aggregate(items).count(),

  /**
   * Sum numeric values
   */
  sum: <T>(items: T[], field?: string): number => aggregate(items).sum(field),

  /**
   * Calculate average
   */
  avg: <T>(items: T[], field?: string): number => aggregate(items).avg(field),

  /**
   * Find minimum
   */
  min: <T>(items: T[], field?: string): T | number | undefined =>
    aggregate(items).min(field),

  /**
   * Find maximum
   */
  max: <T>(items: T[], field?: string): T | number | undefined =>
    aggregate(items).max(field),

  /**
   * Group by field
   */
  groupBy: <T, K extends string>(items: T[], field: K): Record<string, T[]> =>
    aggregate(items).groupBy(field),

  /**
   * Get distinct values
   */
  distinct: <T>(items: T[], field?: string): any[] =>
    aggregate(items).distinct(field),

  /**
   * Calculate statistics
   */
  stats: <T>(items: T[], field?: string) => aggregate(items).stats(field),

  /**
   * Get frequency distribution
   */
  frequency: <T>(items: T[], field?: string): Record<string, number> =>
    aggregate(items).frequency(field),

  /**
   * Calculate median
   */
  median: <T>(items: T[], field?: string): number | undefined =>
    aggregate(items).median(field),

  /**
   * Calculate percentile
   */
  percentile: <T>(items: T[], p: number, field?: string): number | undefined =>
    aggregate(items).percentile(p, field)
};
