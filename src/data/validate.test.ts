import { describe, expect, it } from 'vitest';
import { CATEGORIES, type Category } from './categories';
import { ContentError, MAX_WORD_LENGTH, validateContent } from './validate';

// 6 categories x 5 words = 36 cards, comfortably above the 29-card minimum.
function makeValidCategories(): Category[] {
  return Array.from({ length: 6 }, (_, c) => ({
    id: `cat${c}`,
    name: `Category ${c}`,
    words: Array.from({ length: 5 }, (_, w) => `w${c}x${w}`),
  }));
}

function withCategory(patch: Partial<Category>, at: number): Category[] {
  return makeValidCategories().map((c, i) => (i === at ? { ...c, ...patch } : c));
}

describe('validateContent', () => {
  it('accepts the real content set', () => {
    expect(validateContent(CATEGORIES)).toEqual({ warnings: [] });
  });

  it('accepts a valid fixture', () => {
    expect(validateContent(makeValidCategories())).toEqual({ warnings: [] });
  });

  it('rejects a duplicate category id, naming it', () => {
    const categories = withCategory({ id: 'cat0' }, 1);
    expect(() => validateContent(categories)).toThrowError(/duplicate category id "cat0"/);
  });

  it('rejects a duplicate category name, naming it', () => {
    const categories = withCategory({ name: 'Category 0' }, 1);
    expect(() => validateContent(categories)).toThrowError(/duplicate category name/);
  });

  it('rejects the same word in two categories, naming word and categories', () => {
    const categories = withCategory({ words: ['w0x0', 'a', 'b', 'c', 'd'] }, 2);
    expect(() => validateContent(categories)).toThrowError(
      /word "w0x0" appears in both "cat0" and "cat2"/,
    );
  });

  it('rejects a category with zero words, naming it', () => {
    const categories = withCategory({ words: [] }, 3);
    expect(() => validateContent(categories)).toThrowError(/category "cat3" has no words/);
  });

  it('rejects a deck smaller than 29 cards, stating the size', () => {
    const categories = makeValidCategories().slice(0, 4);
    expect(() => validateContent(categories)).toThrowError(/deck has 24 cards, needs at least 29/);
  });

  it('collects every problem into one ContentError', () => {
    const categories = withCategory({ id: 'cat0', words: [] }, 1);
    let caught: unknown;
    try {
      validateContent(categories);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ContentError);
    const message = (caught as ContentError).message;
    expect(message).toMatch(/duplicate category id "cat0"/);
    expect(message).toMatch(/category "cat0" has no words/);
  });

  it('warns, without throwing, on words longer than MAX_WORD_LENGTH', () => {
    const longWord = 'x'.repeat(MAX_WORD_LENGTH + 1);
    const categories = withCategory({ words: ['a', 'b', 'c', 'd', longWord] }, 0);
    const { warnings } = validateContent(categories);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain(longWord);
  });
});
