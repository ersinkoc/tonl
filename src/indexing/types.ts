/**
 * Types for TONL Indexing System
 */

export interface Index {
  name: string;
  fields: string[];
  unique: boolean;
  type: 'hash' | 'btree';
}

export interface IndexEntry {
  key: any;
  path: string;
}

export type IndexType = 'hash' | 'btree';
