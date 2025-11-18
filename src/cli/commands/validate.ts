/**
 * Validate Command
 */

import { decodeTONL } from "../../index.js";
import { parseSchema, validateTONL } from "../../schema/index.js";
import { safeReadFile } from "../utils.js";
import type { Command, CommandContext } from "../types.js";

export const ValidateCommand: Command = {
  name: "validate",
  description: "Validate TONL file against schema",

  async execute(context: CommandContext): Promise<void> {
    const { file, options, input } = context;

    if (!file.endsWith('.tonl')) {
      console.error("❌ Error: Validate command requires a .tonl file");
      process.exit(1);
    }

    if (!options.schema) {
      console.error("❌ Error: --schema <file.schema.tonl> is required");
      process.exit(1);
    }

    // Load schema (with path validation)
    const schemaContent = safeReadFile(options.schema);
    const schema = parseSchema(schemaContent);

    // Parse data
    const data = decodeTONL(input, {
      delimiter: options.delimiter,
      strict: options.strict
    });

    // Validate
    const result = validateTONL(data, schema);

    if (result.valid) {
      console.log(`✅ Validation successful: ${file} conforms to schema`);
      console.log(`   - Schema: ${options.schema}`);
      console.log(`   - Fields validated: ${schema.rootFields.length}`);
      console.log(`   - Errors: 0`);
    } else {
      console.log(`❌ Validation failed: ${result.errors.length} error(s) found\n`);
      result.errors.forEach((err, idx) => {
        console.log(`Error ${idx + 1}: ${err.field}`);
        console.log(`  ${err.message}`);
        if (err.expected) console.log(`  Expected: ${err.expected}`);
        if (err.actual) console.log(`  Actual: ${err.actual}`);
        console.log('');
      });
      process.exit(1);
    }
  }
};