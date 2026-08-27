import { describe, expect, it } from 'vitest';
import { createRng, nextFloat, shuffle } from './rng';

describe('mulberry32', () => {
  it('produces the known sequence for seed 42', () => {
    const rng = createRng(42);
    expect([nextFloat(rng), nextFloat(rng), nextFloat(rng), nextFloat(rng)]).toEqual([
      0.6011037519201636, 0.44829055899754167, 0.8524657934904099, 0.6697340414393693,
    ]);
  });

  it('produces identical sequences for identical seeds', () => {
    const a = createRng(987654321);
    const b = createRng(987654321);
    for (let i = 0; i < 100; i++) {
      expect(nextFloat(a)).toBe(nextFloat(b));
    }
  });

  it('resumes the sequence from a serialized state', () => {
    const original = createRng(42);
    nextFloat(original);
    nextFloat(original);
    nextFloat(original);
    const saved: number = original.state;

    const expected = [nextFloat(original), nextFloat(original)];
    const restored: { state: number } = { state: saved };
    expect([nextFloat(restored), nextFloat(restored)]).toEqual(expected);
  });
});

describe('shuffle', () => {
  const items = Array.from({ length: 42 }, (_, i) => `card-${i}`);

  it('returns a new array and does not mutate the input', () => {
    const input = [...items];
    const out = shuffle(input, createRng(7));
    expect(out).not.toBe(input);
    expect(input).toEqual(items);
    expect([...out].sort()).toEqual([...items].sort());
  });

  it('produces the same order for the same seed', () => {
    expect(shuffle(items, createRng(7))).toEqual(shuffle(items, createRng(7)));
  });

  it('produces different orders for different seeds', () => {
    expect(shuffle(items, createRng(7))).not.toEqual(shuffle(items, createRng(8)));
  });
});
