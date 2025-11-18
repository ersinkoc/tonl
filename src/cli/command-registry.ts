/**
 * Command Registry
 */

import type { Command } from './types.js';
import { EncodeCommand } from './commands/encode.js';
import { DecodeCommand } from './commands/decode.js';
import { StatsCommand } from './commands/stats.js';
import { FormatCommand } from './commands/format.js';
import { ValidateCommand } from './commands/validate.js';
import { QueryCommand } from './commands/query.js';
import { GenerateTypesCommand } from './commands/generate-types.js';

export const commandRegistry = new Map<string, Command>([
  ['encode', EncodeCommand],
  ['decode', DecodeCommand],
  ['stats', StatsCommand],
  ['format', FormatCommand],
  ['validate', ValidateCommand],
  ['query', QueryCommand],
  ['get', QueryCommand], // 'get' is an alias for 'query'
  ['generate-types', GenerateTypesCommand],
]);

export function getCommand(commandName: string): Command | undefined {
  return commandRegistry.get(commandName);
}

export function getAllCommands(): Command[] {
  return Array.from(commandRegistry.values());
}

export function getAvailableCommands(): string[] {
  return Array.from(commandRegistry.keys());
}