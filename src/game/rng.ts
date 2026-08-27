// mulberry32: fast 32-bit PRNG whose entire state is one uint32, so it can be
// stored in game state and resumed after serialization.
export type Rng = { state: number };

export function createRng(seed: number): Rng {
  return { state: seed >>> 0 };
}

export function nextFloat(rng: Rng): number {
  rng.state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = rng.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (pool.length > 0) {
    const j = Math.floor(nextFloat(rng) * pool.length);
    out.push(...pool.splice(j, 1));
  }
  return out;
}
