/**
 * Decode Command
 */

import { decodeTONL } from "../../index.js";
import { safeWriteFile } from "../utils.js";
import type { Command, CommandContext } from "../types.js";

export const DecodeCommand: Command = {
  name: "decode",
  description: "Decode TONL to JSON format",

  async execute(context: CommandContext): Promise<void> {
    const { options, input } = context;

    const jsonData = decodeTONL(input, {
      delimiter: options.delimiter,
      strict: options.strict
    });

    const jsonOutput = JSON.stringify(jsonData, null, 2);

    if (options.out) {
      safeWriteFile(options.out, jsonOutput);
      console.log(`✅ Decoded to ${options.out}`);
    } else {
      console.log(jsonOutput);
    }
  }
};