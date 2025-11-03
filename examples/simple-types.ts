/**
 * Auto-generated TypeScript types from TONL schema
 * Do not edit manually - regenerate with: tonl generate-types
 */

export interface Root {
  /** @minimum 2 */
  name: string;
  /**
   * @minimum 0
   * @maximum 150
   */
  age: number;
  /** @pattern email */
  email: string;
}
