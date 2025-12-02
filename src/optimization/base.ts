/**
 * Base utilities for optimization strategies
 *
 * Provides common interfaces, metrics calculation, and registry pattern
 * for TONL optimization modules.
 */

// ============================================================
// Common Interfaces
// ============================================================

/**
 * Standard metrics for optimization results
 */
export interface OptimizationMetrics {
  /** Original data size in bytes */
  originalBytes: number;
  /** Optimized data size in bytes */
  optimizedBytes: number;
  /** Compression ratio (original / optimized) */
  compressionRatio: number;
  /** Percentage of bytes saved */
  savingsPercent: number;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Standard result structure for optimization operations
 */
export interface OptimizationResult<T = unknown> {
  /** Strategy name that produced this result */
  strategy: string;
  /** Optimized/encoded data */
  data: T;
  /** Metadata needed for decoding */
  metadata: Record<string, unknown>;
  /** Performance metrics */
  metrics: OptimizationMetrics;
  /** Whether optimization was beneficial */
  beneficial: boolean;
}

/**
 * Common interface for all optimization strategies
 */
export interface Optimizer {
  /** Unique strategy name */
  readonly name: string;

  /** Human-readable description */
  readonly description: string;

  /** Analyze data to determine if optimization is beneficial */
  analyze(data: unknown): { beneficial: boolean; estimatedSavings: number };

  /** Encode/optimize data */
  encode(data: unknown, options?: unknown): OptimizationResult<unknown>;

  /** Decode/restore original data */
  decode(encoded: unknown, metadata: Record<string, unknown>): unknown;
}

// ============================================================
// Metrics Utilities
// ============================================================

/**
 * Calculate byte size of a value (JSON serialized)
 */
export function calculateByteSize(value: unknown): number {
  if (value === undefined) return 0;
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return 0;
  }
}

/**
 * Calculate optimization metrics
 */
export function calculateMetrics(
  originalData: unknown,
  optimizedData: unknown,
  startTime: number
): OptimizationMetrics {
  const originalBytes = calculateByteSize(originalData);
  const optimizedBytes = calculateByteSize(optimizedData);
  const processingTimeMs = performance.now() - startTime;

  const compressionRatio = optimizedBytes > 0 ? originalBytes / optimizedBytes : 1;
  const savingsPercent = originalBytes > 0
    ? ((originalBytes - optimizedBytes) / originalBytes) * 100
    : 0;

  return {
    originalBytes,
    optimizedBytes,
    compressionRatio,
    savingsPercent,
    processingTimeMs
  };
}

/**
 * Check if optimization result is beneficial
 */
export function isBeneficial(metrics: OptimizationMetrics, minSavingsPercent = 5): boolean {
  return metrics.savingsPercent >= minSavingsPercent;
}

/**
 * Create a standard optimization result
 */
export function createResult<T>(
  strategy: string,
  data: T,
  metadata: Record<string, unknown>,
  metrics: OptimizationMetrics
): OptimizationResult<T> {
  return {
    strategy,
    data,
    metadata,
    metrics,
    beneficial: isBeneficial(metrics)
  };
}

// ============================================================
// Optimizer Registry
// ============================================================

/**
 * Registry entry for an optimizer
 */
interface OptimizerEntry {
  name: string;
  description: string;
  factory: () => Optimizer;
  priority: number;
}

/**
 * Registry for optimization strategies
 * Allows dynamic discovery and selection of optimizers
 */
class OptimizerRegistry {
  private optimizers = new Map<string, OptimizerEntry>();

  /**
   * Register an optimizer
   */
  register(entry: OptimizerEntry): void {
    this.optimizers.set(entry.name, entry);
  }

  /**
   * Get an optimizer by name
   */
  get(name: string): Optimizer | undefined {
    const entry = this.optimizers.get(name);
    return entry?.factory();
  }

  /**
   * Get all registered optimizer names
   */
  getNames(): string[] {
    return Array.from(this.optimizers.keys());
  }

  /**
   * Get all optimizers sorted by priority
   */
  getAll(): Optimizer[] {
    return Array.from(this.optimizers.values())
      .sort((a, b) => b.priority - a.priority)
      .map(entry => entry.factory());
  }

  /**
   * Check if an optimizer is registered
   */
  has(name: string): boolean {
    return this.optimizers.has(name);
  }

  /**
   * Get optimizer descriptions for documentation
   */
  getDescriptions(): Array<{ name: string; description: string }> {
    return Array.from(this.optimizers.values()).map(entry => ({
      name: entry.name,
      description: entry.description
    }));
  }
}

/**
 * Global optimizer registry instance
 */
export const optimizerRegistry = new OptimizerRegistry();

// ============================================================
// Composition Utilities
// ============================================================

/**
 * Chain multiple optimizers together
 */
export function chainOptimizers<T>(
  data: T,
  optimizers: Optimizer[],
  options?: { stopOnNoImprovement?: boolean }
): OptimizationResult<T> {
  const stopOnNoImprovement = options?.stopOnNoImprovement ?? true;
  const startTime = performance.now();

  let currentData = data;
  let totalMetadata: Record<string, unknown> = {};
  const appliedStrategies: string[] = [];
  let lastBeneficialData = data;

  for (const optimizer of optimizers) {
    const analysis = optimizer.analyze(currentData);
    if (!analysis.beneficial) {
      if (stopOnNoImprovement) continue;
    }

    const result = optimizer.encode(currentData, undefined);

    if (result.beneficial) {
      currentData = result.data as T;
      lastBeneficialData = currentData;
      appliedStrategies.push(optimizer.name);
      totalMetadata[optimizer.name] = result.metadata;
    }
  }

  const metrics = calculateMetrics(data, lastBeneficialData, startTime);

  return {
    strategy: appliedStrategies.join('+') || 'none',
    data: lastBeneficialData,
    metadata: totalMetadata,
    metrics,
    beneficial: appliedStrategies.length > 0
  };
}

/**
 * Select best optimizer for given data
 */
export function selectBestOptimizer(
  data: unknown,
  optimizers: Optimizer[]
): { optimizer: Optimizer; estimatedSavings: number } | null {
  let bestOptimizer: Optimizer | null = null;
  let bestSavings = 0;

  for (const optimizer of optimizers) {
    const analysis = optimizer.analyze(data);
    if (analysis.beneficial && analysis.estimatedSavings > bestSavings) {
      bestOptimizer = optimizer;
      bestSavings = analysis.estimatedSavings;
    }
  }

  return bestOptimizer
    ? { optimizer: bestOptimizer, estimatedSavings: bestSavings }
    : null;
}

// ============================================================
// Data Analysis Utilities
// ============================================================

/**
 * Analyze array for optimization potential
 */
export function analyzeArray(arr: unknown[]): {
  length: number;
  uniqueCount: number;
  uniformType: boolean;
  dominantType: string;
  hasNulls: boolean;
  numericRange: { min: number; max: number } | null;
} {
  if (arr.length === 0) {
    return {
      length: 0,
      uniqueCount: 0,
      uniformType: true,
      dominantType: 'undefined',
      hasNulls: false,
      numericRange: null
    };
  }

  const typeCount = new Map<string, number>();
  const uniqueValues = new Set<unknown>();
  let hasNulls = false;
  let minNum = Infinity;
  let maxNum = -Infinity;
  let hasNumbers = false;

  for (const item of arr) {
    const type = item === null ? 'null' : typeof item;
    typeCount.set(type, (typeCount.get(type) || 0) + 1);

    if (item === null) {
      hasNulls = true;
    }

    if (typeof item === 'number' && isFinite(item)) {
      hasNumbers = true;
      minNum = Math.min(minNum, item);
      maxNum = Math.max(maxNum, item);
    }

    // Only track primitives for uniqueness
    if (item === null || typeof item !== 'object') {
      uniqueValues.add(item);
    }
  }

  // Find dominant type
  let dominantType = 'mixed';
  let maxCount = 0;
  for (const [type, count] of typeCount) {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type;
    }
  }

  return {
    length: arr.length,
    uniqueCount: uniqueValues.size,
    uniformType: typeCount.size === 1,
    dominantType,
    hasNulls,
    numericRange: hasNumbers ? { min: minNum, max: maxNum } : null
  };
}

/**
 * Estimate token count for a value (rough approximation)
 */
export function estimateTokens(value: unknown): number {
  const json = JSON.stringify(value);
  // Rough estimate: ~4 characters per token for typical JSON
  return Math.ceil(json.length / 4);
}
