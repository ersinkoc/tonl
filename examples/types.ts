/**
 * Auto-generated TypeScript types from TONL schema
 * Do not edit manually - regenerate with: tonl generate-types
 * User management system schema
 */

export interface User {
  id: number;
  /**
   * @minimum 3
   * @maximum 20
   * @pattern ^[a-zA-Z0-9_]+$
   */
  username: string;
  /** @pattern email */
  email: string;
  /**
   * @minimum 1
   * @maximum 50
   */
  firstName: string;
  /**
   * @minimum 1
   * @maximum 50
   */
  lastName: string;
  /**
   * @minimum 13
   * @maximum 150
   */
  age?: number | null;
  /** @minimum 1 */
  roles: string[];
  /** @pattern date */
  createdAt: string;
  /** @pattern date */
  updatedAt: string;
  metadata?: object;
}

export interface Root {
  /** @minimum 1 */
  users: User[];
  totalCount: number;
}
