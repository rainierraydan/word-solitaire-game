import type { Category } from './categories';

// T-020 establishes the real character budget for a ~48px card and may revise this.
export const MAX_WORD_LENGTH = 8;

// 28 cards for the tableau plus at least one for the stock.
const MIN_DECK_SIZE = 29;

export class ContentError extends Error {
  constructor(problems: string[]) {
    super(`Invalid content:\n${problems.map((p) => `- ${p}`).join('\n')}`);
    this.name = 'ContentError';
  }
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dups.add(value);
    seen.add(value);
  }
  return [...dups];
}

/**
 * Validates the content set. Throws a ContentError naming every offender on
 * fatal problems; returns non-fatal warnings (words too long for a narrow card).
 */
export function validateContent(categories: Category[]): { warnings: string[] } {
  const problems: string[] = [];

  for (const id of duplicates(categories.map((c) => c.id))) {
    problems.push(`duplicate category id "${id}"`);
  }
  for (const name of duplicates(categories.map((c) => c.name.toLowerCase()))) {
    problems.push(`duplicate category name "${name}"`);
  }

  const owner = new Map<string, string>();
  for (const category of categories) {
    for (const word of category.words) {
      const key = word.toLowerCase();
      const first = owner.get(key);
      if (first !== undefined) {
        problems.push(`word "${word}" appears in both "${first}" and "${category.id}"`);
      } else {
        owner.set(key, category.id);
      }
    }
  }

  for (const category of categories) {
    if (category.words.length === 0) {
      problems.push(`category "${category.id}" has no words`);
    }
  }

  const deckSize = categories.length + categories.reduce((n, c) => n + c.words.length, 0);
  if (deckSize < MIN_DECK_SIZE) {
    problems.push(`deck has ${deckSize} cards, needs at least ${MIN_DECK_SIZE}`);
  }

  if (problems.length > 0) {
    throw new ContentError(problems);
  }

  const longWords = categories.flatMap((c) => c.words.filter((w) => w.length > MAX_WORD_LENGTH));
  const warnings =
    longWords.length > 0
      ? [
          `words longer than ${MAX_WORD_LENGTH} characters may not fit on a card: ${longWords.join(', ')}`,
        ]
      : [];

  return { warnings };
}
