/**
 * Tests for optimization base utilities
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateByteSize,
  calculateMetrics,
  isBeneficial,
  createResult,
  optimizerRegistry,
  chainOptimizers,
  selectBestOptimizer,
  analyzeArray,
  estimateTokens,
  type Optimizer,
  type OptimizationResult
} from '../../dist/optimization/index.js';

describe('Optimization Base Utilities', () => {

  describe('calculateByteSize', () => {

    it('should calculate size of simple string', () => {
      const size = calculateByteSize('hello');
      assert.strictEqual(size, 7); // "hello" = 7 bytes
    });

    it('should calculate size of object', () => {
      const size = calculateByteSize({ a: 1, b: 2 });
      assert.ok(size > 0);
    });

    it('should return 0 for undefined', () => {
      const size = calculateByteSize(undefined);
      assert.strictEqual(size, 0);
    });

    it('should handle arrays', () => {
      const size = calculateByteSize([1, 2, 3]);
      assert.strictEqual(size, 7); // [1,2,3] = 7 bytes
    });

    it('should handle nested structures', () => {
      const size = calculateByteSize({ arr: [1, 2], obj: { x: 1 } });
      assert.ok(size > 20);
    });
  });

  describe('calculateMetrics', () => {

    it('should calculate compression ratio', () => {
      const startTime = performance.now() - 10;
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const optimized = [1, 10]; // Simulated compression

      const metrics = calculateMetrics(original, optimized, startTime);

      assert.ok(metrics.originalBytes > metrics.optimizedBytes);
      assert.ok(metrics.compressionRatio > 1);
      assert.ok(metrics.savingsPercent > 0);
      assert.ok(metrics.processingTimeMs >= 0);
    });

    it('should handle equal sizes', () => {
      const startTime = performance.now();
      const data = [1, 2, 3];

      const metrics = calculateMetrics(data, data, startTime);

      assert.strictEqual(metrics.compressionRatio, 1);
      assert.strictEqual(metrics.savingsPercent, 0);
    });

    it('should handle empty data', () => {
      const startTime = performance.now();

      const metrics = calculateMetrics([], [], startTime);

      assert.strictEqual(metrics.originalBytes, 2); // []
      assert.strictEqual(metrics.optimizedBytes, 2);
    });
  });

  describe('isBeneficial', () => {

    it('should return true for significant savings', () => {
      const metrics = {
        originalBytes: 100,
        optimizedBytes: 80,
        compressionRatio: 1.25,
        savingsPercent: 20,
        processingTimeMs: 1
      };

      assert.strictEqual(isBeneficial(metrics), true);
    });

    it('should return false for minimal savings', () => {
      const metrics = {
        originalBytes: 100,
        optimizedBytes: 98,
        compressionRatio: 1.02,
        savingsPercent: 2,
        processingTimeMs: 1
      };

      assert.strictEqual(isBeneficial(metrics), false);
    });

    it('should respect custom threshold', () => {
      const metrics = {
        originalBytes: 100,
        optimizedBytes: 95,
        compressionRatio: 1.05,
        savingsPercent: 5,
        processingTimeMs: 1
      };

      assert.strictEqual(isBeneficial(metrics, 10), false);
      assert.strictEqual(isBeneficial(metrics, 3), true);
    });
  });

  describe('createResult', () => {

    it('should create properly structured result', () => {
      const metrics = {
        originalBytes: 100,
        optimizedBytes: 50,
        compressionRatio: 2,
        savingsPercent: 50,
        processingTimeMs: 5
      };

      const result = createResult('test', [1, 2], { key: 'value' }, metrics);

      assert.strictEqual(result.strategy, 'test');
      assert.deepStrictEqual(result.data, [1, 2]);
      assert.deepStrictEqual(result.metadata, { key: 'value' });
      assert.strictEqual(result.beneficial, true);
    });
  });

  describe('optimizerRegistry', () => {

    it('should register and retrieve optimizers', () => {
      const mockOptimizer: Optimizer = {
        name: 'test-mock',
        description: 'Test optimizer',
        analyze: () => ({ beneficial: true, estimatedSavings: 10 }),
        encode: (data) => ({
          strategy: 'test-mock',
          data,
          metadata: {},
          metrics: {
            originalBytes: 100,
            optimizedBytes: 90,
            compressionRatio: 1.1,
            savingsPercent: 10,
            processingTimeMs: 1
          },
          beneficial: true
        }),
        decode: (data) => data
      };

      optimizerRegistry.register({
        name: 'test-mock',
        description: 'Test optimizer',
        factory: () => mockOptimizer,
        priority: 1
      });

      assert.strictEqual(optimizerRegistry.has('test-mock'), true);
      assert.ok(optimizerRegistry.getNames().includes('test-mock'));

      const retrieved = optimizerRegistry.get('test-mock');
      assert.strictEqual(retrieved?.name, 'test-mock');
    });

    it('should return undefined for unknown optimizer', () => {
      const result = optimizerRegistry.get('unknown-optimizer');
      assert.strictEqual(result, undefined);
    });
  });

  describe('analyzeArray', () => {

    it('should analyze numeric array', () => {
      const analysis = analyzeArray([1, 2, 3, 4, 5]);

      assert.strictEqual(analysis.length, 5);
      assert.strictEqual(analysis.uniqueCount, 5);
      assert.strictEqual(analysis.uniformType, true);
      assert.strictEqual(analysis.dominantType, 'number');
      assert.strictEqual(analysis.hasNulls, false);
      assert.deepStrictEqual(analysis.numericRange, { min: 1, max: 5 });
    });

    it('should analyze string array', () => {
      const analysis = analyzeArray(['a', 'b', 'a', 'c']);

      assert.strictEqual(analysis.length, 4);
      assert.strictEqual(analysis.uniqueCount, 3);
      assert.strictEqual(analysis.dominantType, 'string');
      assert.strictEqual(analysis.numericRange, null);
    });

    it('should detect mixed types', () => {
      const analysis = analyzeArray([1, 'a', true, null]);

      assert.strictEqual(analysis.uniformType, false);
      assert.strictEqual(analysis.hasNulls, true);
    });

    it('should handle empty array', () => {
      const analysis = analyzeArray([]);

      assert.strictEqual(analysis.length, 0);
      assert.strictEqual(analysis.uniqueCount, 0);
      assert.strictEqual(analysis.uniformType, true);
    });

    it('should handle array with nulls', () => {
      const analysis = analyzeArray([1, null, 2, null, 3]);

      assert.strictEqual(analysis.hasNulls, true);
      assert.deepStrictEqual(analysis.numericRange, { min: 1, max: 3 });
    });
  });

  describe('estimateTokens', () => {

    it('should estimate tokens for simple value', () => {
      const tokens = estimateTokens('hello world');
      assert.ok(tokens > 0);
      assert.ok(tokens < 10);
    });

    it('should estimate tokens for object', () => {
      const tokens = estimateTokens({ name: 'test', value: 123 });
      assert.ok(tokens > 5);
    });

    it('should estimate tokens for array', () => {
      const tokens = estimateTokens([1, 2, 3, 4, 5]);
      assert.ok(tokens >= 2);
    });
  });

  describe('selectBestOptimizer', () => {

    it('should select optimizer with highest savings', () => {
      const optimizers: Optimizer[] = [
        {
          name: 'low-savings',
          description: 'Low savings',
          analyze: () => ({ beneficial: true, estimatedSavings: 5 }),
          encode: () => ({} as OptimizationResult),
          decode: (d) => d
        },
        {
          name: 'high-savings',
          description: 'High savings',
          analyze: () => ({ beneficial: true, estimatedSavings: 20 }),
          encode: () => ({} as OptimizationResult),
          decode: (d) => d
        }
      ];

      const result = selectBestOptimizer([1, 2, 3], optimizers);

      assert.ok(result !== null);
      assert.strictEqual(result?.optimizer.name, 'high-savings');
      assert.strictEqual(result?.estimatedSavings, 20);
    });

    it('should return null when no beneficial optimizers', () => {
      const optimizers: Optimizer[] = [
        {
          name: 'not-beneficial',
          description: 'Not beneficial',
          analyze: () => ({ beneficial: false, estimatedSavings: 0 }),
          encode: () => ({} as OptimizationResult),
          decode: (d) => d
        }
      ];

      const result = selectBestOptimizer([1, 2, 3], optimizers);

      assert.strictEqual(result, null);
    });
  });
});
