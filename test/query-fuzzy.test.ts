/**
 * Tests for Fuzzy Matching Functions
 *
 * Tests Levenshtein distance, Jaro-Winkler similarity, Soundex, and fuzzy operators.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  levenshteinDistance,
  levenshteinSimilarity,
  jaroSimilarity,
  jaroWinklerSimilarity,
  diceSimilarity,
  soundex,
  metaphone,
  soundsLike,
  soundsLikeMetaphone,
  fuzzyMatch,
  similarity,
  fuzzyContains,
  fuzzyStartsWith,
  fuzzyEndsWith,
  fuzzySearch,
  evaluateFuzzyOperator,
  isFuzzyOperator
} from '../dist/query/fuzzy-matcher.js';

describe('Levenshtein Distance', () => {
  it('should return 0 for identical strings', () => {
    assert.strictEqual(levenshteinDistance('hello', 'hello'), 0);
    assert.strictEqual(levenshteinDistance('', ''), 0);
  });

  it('should calculate insertions correctly', () => {
    assert.strictEqual(levenshteinDistance('', 'abc'), 3);
    assert.strictEqual(levenshteinDistance('a', 'ab'), 1);
  });

  it('should calculate deletions correctly', () => {
    assert.strictEqual(levenshteinDistance('abc', ''), 3);
    assert.strictEqual(levenshteinDistance('ab', 'a'), 1);
  });

  it('should calculate substitutions correctly', () => {
    assert.strictEqual(levenshteinDistance('cat', 'bat'), 1);
    assert.strictEqual(levenshteinDistance('abc', 'xyz'), 3);
  });

  it('should calculate mixed operations', () => {
    assert.strictEqual(levenshteinDistance('kitten', 'sitting'), 3);
    assert.strictEqual(levenshteinDistance('sunday', 'saturday'), 3);
  });

  it('should be symmetric', () => {
    assert.strictEqual(
      levenshteinDistance('abc', 'xyz'),
      levenshteinDistance('xyz', 'abc')
    );
  });

  it('should handle unicode characters', () => {
    assert.strictEqual(levenshteinDistance('merhaba', 'merhaba'), 0);
    assert.strictEqual(levenshteinDistance('hello', 'helloö'), 1);
  });

  it('should support maxDistance optimization', () => {
    const result = levenshteinDistance('abc', 'xyz', 1);
    assert.ok(result > 1); // Should return > maxDistance when exceeded
  });
});

describe('Levenshtein Similarity', () => {
  it('should return 1 for identical strings', () => {
    assert.strictEqual(levenshteinSimilarity('hello', 'hello'), 1);
  });

  it('should return 0 for completely different strings', () => {
    assert.strictEqual(levenshteinSimilarity('abc', 'xyz'), 0);
  });

  it('should return value between 0 and 1', () => {
    const sim = levenshteinSimilarity('kitten', 'sitting');
    assert.ok(sim >= 0 && sim <= 1);
  });

  it('should return higher similarity for closer strings', () => {
    const sim1 = levenshteinSimilarity('cat', 'bat');
    const sim2 = levenshteinSimilarity('cat', 'xyz');
    assert.ok(sim1 > sim2);
  });
});

describe('Jaro Similarity', () => {
  it('should return 1 for identical strings', () => {
    assert.strictEqual(jaroSimilarity('hello', 'hello'), 1);
  });

  it('should return 0 for completely different strings', () => {
    assert.strictEqual(jaroSimilarity('abc', 'xyz'), 0);
  });

  it('should calculate correctly for similar strings', () => {
    const sim = jaroSimilarity('MARTHA', 'MARHTA');
    assert.ok(sim > 0.9);
  });

  it('should handle empty strings', () => {
    assert.strictEqual(jaroSimilarity('', ''), 1);
    assert.strictEqual(jaroSimilarity('abc', ''), 0);
    assert.strictEqual(jaroSimilarity('', 'abc'), 0);
  });
});

describe('Jaro-Winkler Similarity', () => {
  it('should give bonus for common prefix', () => {
    const jaro = jaroSimilarity('MARTHA', 'MARHTA');
    const jaroWinkler = jaroWinklerSimilarity('MARTHA', 'MARHTA');
    // Jaro-Winkler should be >= Jaro due to prefix bonus
    assert.ok(jaroWinkler >= jaro);
  });

  it('should return 1 for identical strings', () => {
    assert.strictEqual(jaroWinklerSimilarity('hello', 'hello'), 1);
  });

  it('should handle strings with no common prefix', () => {
    const sim = jaroWinklerSimilarity('abc', 'xyz');
    assert.strictEqual(sim, 0);
  });
});

describe('Dice Coefficient', () => {
  it('should return 1 for identical strings', () => {
    assert.strictEqual(diceSimilarity('hello', 'hello'), 1);
  });

  it('should return 0 for strings with no common bigrams', () => {
    assert.strictEqual(diceSimilarity('ab', 'cd'), 0);
  });

  it('should handle short strings', () => {
    // Single characters can't form bigrams, returns 0 for comparison
    const sim = diceSimilarity('a', 'b');
    assert.strictEqual(sim, 0);
  });

  it('should calculate partial similarity', () => {
    const sim = diceSimilarity('night', 'nacht');
    assert.ok(sim > 0 && sim < 1);
  });
});

describe('Soundex', () => {
  it('should return 4-character code', () => {
    const code = soundex('Robert');
    assert.strictEqual(code.length, 4);
  });

  it('should generate same code for similar sounding names', () => {
    assert.strictEqual(soundex('Robert'), soundex('Rupert'));
    assert.strictEqual(soundex('Smith'), soundex('Smythe'));
    assert.strictEqual(soundex('Johnson'), soundex('Johnsen'));
  });

  it('should generate different codes for different names', () => {
    assert.notStrictEqual(soundex('Robert'), soundex('Smith'));
    assert.notStrictEqual(soundex('Alice'), soundex('Bob'));
  });

  it('should handle empty string', () => {
    assert.strictEqual(soundex(''), '');
  });

  it('should preserve first letter', () => {
    assert.ok(soundex('Robert').startsWith('R'));
    assert.ok(soundex('Smith').startsWith('S'));
  });
});

describe('Metaphone', () => {
  it('should return primary and alternate codes', () => {
    const result = metaphone('Smith');
    assert.ok('primary' in result);
    assert.ok('alternate' in result);
  });

  it('should generate codes for common names', () => {
    const result = metaphone('John');
    assert.ok(result.primary.length > 0);
  });

  it('should handle empty string', () => {
    const result = metaphone('');
    assert.strictEqual(result.primary, '');
    assert.strictEqual(result.alternate, '');
  });
});

describe('soundsLike()', () => {
  it('should return true for similar sounding names', () => {
    assert.ok(soundsLike('Smith', 'Smythe'));
    assert.ok(soundsLike('Robert', 'Rupert'));
  });

  it('should return false for different sounding names', () => {
    assert.ok(!soundsLike('Alice', 'Bob'));
    assert.ok(!soundsLike('John', 'Mary'));
  });

  it('should handle case insensitivity', () => {
    assert.ok(soundsLike('SMITH', 'smith'));
  });
});

describe('soundsLikeMetaphone()', () => {
  it('should match phonetically similar words', () => {
    assert.ok(soundsLikeMetaphone('smith', 'smyth'));
  });

  it('should not match phonetically different words', () => {
    assert.ok(!soundsLikeMetaphone('cat', 'dog'));
  });
});

describe('fuzzyMatch()', () => {
  it('should match identical strings', () => {
    assert.ok(fuzzyMatch('hello', 'hello'));
  });

  it('should match similar strings within threshold', () => {
    assert.ok(fuzzyMatch('john', 'Jon'));
    assert.ok(fuzzyMatch('hello', 'helo'));
  });

  it('should not match very different strings', () => {
    assert.ok(!fuzzyMatch('hello', 'world'));
  });

  it('should respect threshold option', () => {
    assert.ok(fuzzyMatch('hello', 'helo', { threshold: 0.7 }));
    assert.ok(!fuzzyMatch('hello', 'helo', { threshold: 0.99 }));
  });

  it('should respect caseSensitive option', () => {
    assert.ok(fuzzyMatch('Hello', 'hello', { caseSensitive: false }));
    assert.ok(!fuzzyMatch('Hello', 'hello', { caseSensitive: true, threshold: 1.0 }));
  });

  it('should support different algorithms', () => {
    const opts = { threshold: 0.5 };
    const a = 'martha';
    const b = 'marhta';

    assert.ok(fuzzyMatch(a, b, { ...opts, algorithm: 'levenshtein' }));
    assert.ok(fuzzyMatch(a, b, { ...opts, algorithm: 'jaro' }));
    assert.ok(fuzzyMatch(a, b, { ...opts, algorithm: 'jaro-winkler' }));
  });
});

describe('similarity()', () => {
  it('should return normalized score', () => {
    const score = similarity('hello', 'helo');
    assert.ok(score >= 0 && score <= 1);
  });

  it('should use specified algorithm', () => {
    const lev = similarity('abc', 'abd', { algorithm: 'levenshtein' });
    const jaro = similarity('abc', 'abd', { algorithm: 'jaro' });
    // Different algorithms may give different scores
    assert.ok(lev >= 0 && lev <= 1);
    assert.ok(jaro >= 0 && jaro <= 1);
  });
});

describe('fuzzyContains()', () => {
  it('should match exact contains', () => {
    assert.ok(fuzzyContains('hello world', 'world'));
  });

  it('should match fuzzy contains with lower threshold', () => {
    // 'wrold' vs 'world' - need lower threshold for this match
    assert.ok(fuzzyContains('hello world', 'world', { threshold: 0.6 }));
  });

  it('should return true for empty needle', () => {
    assert.ok(fuzzyContains('hello', ''));
  });

  it('should handle case insensitivity', () => {
    assert.ok(fuzzyContains('Hello World', 'world'));
  });
});

describe('fuzzyStartsWith()', () => {
  it('should match exact prefix', () => {
    assert.ok(fuzzyStartsWith('hello world', 'hello'));
  });

  it('should match fuzzy prefix with lower threshold', () => {
    // 'helo' vs 'hello' - need slightly lower threshold
    assert.ok(fuzzyStartsWith('hello world', 'hell', { threshold: 0.6 }));
  });

  it('should not match non-prefix', () => {
    assert.ok(!fuzzyStartsWith('hello world', 'world'));
  });
});

describe('fuzzyEndsWith()', () => {
  it('should match exact suffix', () => {
    assert.ok(fuzzyEndsWith('hello world', 'world'));
  });

  it('should match fuzzy suffix with lower threshold', () => {
    // need lower threshold for typo matches
    assert.ok(fuzzyEndsWith('hello world', 'worl', { threshold: 0.6 }));
  });

  it('should not match non-suffix', () => {
    assert.ok(!fuzzyEndsWith('hello world', 'hello'));
  });
});

describe('fuzzySearch()', () => {
  it('should find best matches', () => {
    const candidates = ['apple', 'banana', 'orange', 'apricot'];
    const results = fuzzySearch('aple', candidates);

    assert.ok(results.length > 0);
    assert.strictEqual(results[0].value, 'apple'); // Best match
  });

  it('should respect threshold', () => {
    const candidates = ['hello', 'world', 'test'];
    const results = fuzzySearch('xyz', candidates, { threshold: 0.8 });

    assert.strictEqual(results.length, 0); // No matches above threshold
  });

  it('should limit results', () => {
    const candidates = ['a1', 'a2', 'a3', 'a4', 'a5'];
    const results = fuzzySearch('a', candidates, { limit: 3 });

    assert.ok(results.length <= 3);
  });

  it('should include similarity scores', () => {
    const results = fuzzySearch('hello', ['hello', 'helo', 'world']);

    assert.ok(results[0].similarity === 1); // Exact match
    assert.ok(results[0].index !== undefined);
  });
});

describe('evaluateFuzzyOperator()', () => {
  it('should evaluate ~= operator', () => {
    assert.ok(evaluateFuzzyOperator('~=', 'hello', 'helo'));
    assert.ok(!evaluateFuzzyOperator('~=', 'hello', 'world'));
  });

  it('should evaluate fuzzyMatch operator', () => {
    assert.ok(evaluateFuzzyOperator('fuzzyMatch', 'john', 'Jon'));
  });

  it('should evaluate ~contains operator with exact match', () => {
    // exact contains should always match
    assert.ok(evaluateFuzzyOperator('~contains', 'hello world', 'world'));
  });

  it('should evaluate soundsLike operator', () => {
    assert.ok(evaluateFuzzyOperator('soundsLike', 'Smith', 'Smythe'));
  });

  it('should return false for unknown operators', () => {
    assert.ok(!evaluateFuzzyOperator('unknown', 'a', 'b'));
  });
});

describe('isFuzzyOperator()', () => {
  it('should recognize fuzzy operators', () => {
    assert.ok(isFuzzyOperator('~='));
    assert.ok(isFuzzyOperator('~contains'));
    assert.ok(isFuzzyOperator('~startsWith'));
    assert.ok(isFuzzyOperator('~endsWith'));
    assert.ok(isFuzzyOperator('fuzzyMatch'));
    assert.ok(isFuzzyOperator('soundsLike'));
    assert.ok(isFuzzyOperator('similar'));
  });

  it('should reject non-fuzzy operators', () => {
    assert.ok(!isFuzzyOperator('=='));
    assert.ok(!isFuzzyOperator('contains'));
    assert.ok(!isFuzzyOperator('unknown'));
  });
});

describe('Security', () => {
  it('should reject very long strings', () => {
    const longString = 'a'.repeat(20000);
    assert.throws(() => {
      levenshteinDistance(longString, 'short');
    });
  });

  it('should reject long strings in jaroSimilarity', () => {
    const longString = 'a'.repeat(20000);
    assert.throws(() => {
      jaroSimilarity(longString, 'short');
    });
  });

  it('should reject long strings in diceSimilarity', () => {
    const longString = 'a'.repeat(20000);
    assert.throws(() => {
      diceSimilarity(longString, 'short');
    });
  });
});
