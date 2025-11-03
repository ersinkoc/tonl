/**
 * Parser utility functions
 */

import type { TONLParseContext } from '../types.js';

/**
 * Extract lines belonging to a nested block starting from a header line
 * @param lines All lines in the content
 * @param startIndex Index of the header line
 * @returns Lines belonging to the nested block (excluding the header)
 */
export function extractNestedBlockLines(lines: string[], startIndex: number): string[] {
  const result: string[] = [];
  const headerLine = lines[startIndex];
  if (!headerLine) return result;

  // Get the indentation of the header line
  const headerIndent = headerLine.match(/^(\s*)/)?.[1]?.length || 0;

  // Start from the line after the header
  let i = startIndex + 1;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // Skip empty lines but include them to preserve structure
      result.push(line);
      i++;
      continue;
    }

    // Check if this line has less or equal indentation than the header (means we've exited the nested block)
    const currentIndent = line.match(/^(\s*)/)?.[1]?.length || 0;
    if (currentIndent <= headerIndent) {
      break;
    }

    result.push(line);
    i++;
  }

  return result;
}

/**
 * Find the index of the next header at the same or higher level
 * @param lines All lines in the content
 * @param currentIndex Current line index
 * @param context Parse context
 * @returns Index of the next header, or lines.length if none found
 */
export function findNextHeader(lines: string[], currentIndex: number, context: TONLParseContext): number {
  const currentLine = lines[currentIndex];
  const currentIndent = currentLine?.match(/^(\s*)/)?.[1]?.length || 0;

  let i = currentIndex + 1;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Check if this line is at the same or less indentation level (same level or higher)
    const lineIndent = line.match(/^(\s*)/)?.[1]?.length || 0;
    if (lineIndent <= currentIndent && (trimmed.endsWith(':') || trimmed.startsWith('#'))) {
      return i;
    }

    i++;
  }
  return i;
}
