/**
 * Hash-based index for O(1) lookups
 */

export class HashIndex {
  private index: Map<any, string[]> = new Map();

  insert(key: any, path: string): void {
    const existing = this.index.get(key) || [];
    existing.push(path);
    this.index.set(key, existing);
  }

  find(key: any): string[] {
    return this.index.get(key) || [];
  }

  has(key: any): boolean {
    return this.index.has(key);
  }

  clear(): void {
    this.index.clear();
  }

  size(): number {
    return this.index.size;
  }
}
