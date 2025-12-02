/**
 * Property Security Utilities
 *
 * Centralized protection against prototype pollution attacks.
 * Used by query evaluator, modification setter, and filter evaluator.
 *
 * Task 002: Consolidated from duplicated definitions in:
 * - src/query/evaluator.ts
 * - src/modification/setter.ts
 * - src/query/filter-evaluator.ts
 */

/**
 * Dangerous property names that could lead to prototype pollution.
 * These properties are blocked in all query and modification operations.
 */
export const DANGEROUS_PROPERTIES = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/**
 * Check if a property name is dangerous (prototype pollution risk)
 *
 * @param propertyName - The property name to check
 * @returns True if the property name could cause prototype pollution
 */
export function isDangerousProperty(propertyName: string): boolean {
  return DANGEROUS_PROPERTIES.has(propertyName);
}
