/**
 * Encode Command
 */

import { encodeTONL, encodeSmart } from "../../index.js";
import { safeJsonParse } from "../../utils/strings.js";
import { estimateTokens } from "../../utils/metrics.js";
import { safeWriteFile, byteSize, displayStats } from "../utils.js";
import type { Command, CommandContext } from "../types.js";
import type { TONLValue } from "../../types.js";

export const EncodeCommand: Command = {
  name: "encode",
  description: "Encode JSON to TONL format",

  async execute(context: CommandContext): Promise<void> {
    const { file, options, input } = context;

    let tonlOutput: string;
    const jsonData = safeJsonParse(input) as TONLValue;

    if (options.optimize) {
      // Use optimization
      console.log('🚀 Applying advanced optimization...');

      // Dynamically import optimization module
      const { AdaptiveOptimizer } = await import('../../optimization/index.js');
      const optimizer = new AdaptiveOptimizer();

      const optimizationResult = optimizer.optimize(jsonData as any[]);

      // Build TONL with directives
      const directives = optimizationResult.directives.join('\n') + '\n';
      const baseTONL = encodeSmart(optimizationResult.optimizedData, {
        delimiter: options.delimiter,
        includeTypes: options.includeTypes,
        version: options.version,
        indent: options.indent,
        singleLinePrimitiveLists: true,
        compactTables: options.compactTables,
        schemaFirst: options.schemaFirst
      });

      tonlOutput = directives + baseTONL;

      if (options.verbose) {
        console.log('\n📊 Optimization Analysis:');
        console.log(`Recommended strategies: ${optimizationResult.analysis.recommendedStrategies.join(', ')}`);
        console.log(`Estimated savings: ${optimizationResult.analysis.estimatedSavings}%`);
        console.log(`Applied optimizations: ${optimizationResult.directives.length}`);

        if (optimizationResult.analysis.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          optimizationResult.analysis.warnings.forEach((warning: any) => {
            console.log(`  • ${warning}`);
          });
        }

        console.log('\n🔧 Optimization Details:');
        optimizationResult.analysis.appliedOptimizations.forEach((detail: any) => {
          console.log(`  • ${detail}`);
        });
      }
    } else {
      // Use regular encoding
      const encodeFunc = options.smart ? encodeSmart : encodeTONL;
      tonlOutput = encodeFunc(jsonData, {
        delimiter: options.delimiter,
        includeTypes: options.includeTypes,
        version: options.version,
        indent: options.indent,
        singleLinePrimitiveLists: true,
        compactTables: options.compactTables,
        schemaFirst: options.schemaFirst
      });
    }

    if (options.out) {
      safeWriteFile(options.out, tonlOutput);
      console.log(`✅ Encoded to ${options.out}`);
    } else {
      console.log(tonlOutput);
    }

    if (options.stats) {
      const originalBytes = byteSize(JSON.stringify(jsonData));
      const originalTokens = estimateTokens(JSON.stringify(jsonData), options.tokenizer);
      const tonlBytes = byteSize(tonlOutput);
      const tonlTokens = estimateTokens(tonlOutput, options.tokenizer);
      displayStats(originalBytes, originalTokens, tonlBytes, tonlTokens, file);
    }
  }
};