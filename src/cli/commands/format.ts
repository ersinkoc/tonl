/**
 * Format Command
 */

import { encodeTONL, decodeTONL } from "../../index.js";
import { safeWriteFile } from "../utils.js";
import type { Command, CommandContext } from "../types.js";

export const FormatCommand: Command = {
  name: "format",
  description: "Format TONL file with proper indentation and delimiters",

  async execute(context: CommandContext): Promise<void> {
    const { file, options, input } = context;

    if (!file.endsWith('.tonl')) {
      console.error("❌ Error: Format command requires a .tonl file");
      process.exit(1);
    }

    // Parse the TONL file
    const jsonData = decodeTONL(input, {
      delimiter: options.delimiter,
      strict: options.strict
    });

    // Re-encode with pretty formatting
    const formattedOutput = encodeTONL(jsonData, {
      delimiter: options.delimiter,
      includeTypes: options.includeTypes,
      version: options.version,
      indent: options.indent || 2,
      singleLinePrimitiveLists: true,
      prettyDelimiters: options.pretty
    });

    if (options.out) {
      safeWriteFile(options.out, formattedOutput);
      console.log(`✅ Formatted to ${options.out}`);
    } else {
      console.log(formattedOutput);
    }
  }
};