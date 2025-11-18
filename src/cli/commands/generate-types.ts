/**
 * Generate Types Command
 */

import { parseSchema, generateTypeScript } from "../../schema/index.js";
import { safeWriteFile } from "../utils.js";
import type { Command, CommandContext } from "../types.js";

export const GenerateTypesCommand: Command = {
  name: "generate-types",
  description: "Generate TypeScript types from TONL schema",

  async execute(context: CommandContext): Promise<void> {
    const { file, options, input } = context;

    if (!file.endsWith('.schema.tonl')) {
      console.error("❌ Error: generate-types requires a .schema.tonl file");
      process.exit(1);
    }

    if (!options.out) {
      console.error("❌ Error: --out <file.ts> is required for generate-types");
      process.exit(1);
    }

    // Load schema (note: 'file' already validated in main, but use safeReadFile for consistency)
    const schemaContent = input; // Already read safely
    const schema = parseSchema(schemaContent);

    // Generate TypeScript
    const tsCode = generateTypeScript(schema, {
      exportAll: true,
      readonly: false,
      strict: false
    });

    // Write output (with path validation)
    safeWriteFile(options.out, tsCode);
    console.log(`✅ Generated TypeScript types: ${options.out}`);
    console.log(`   - Custom types: ${schema.customTypes.size}`);
    console.log(`   - Root fields: ${schema.rootFields.length}`);
  }
};