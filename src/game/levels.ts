import { FOUNDATION_IDS, TABLEAU_IDS } from './state';

export type LevelConfig = {
  categoryCount: number;
  columnCount: number;
  foundationCount: number;
};

// Difficulty curve agreed 2026-08-27: volume grows while foundation slots
// tighten. Columns cap at 8 — the T-020 legibility floor.
const CURVE: LevelConfig[] = [
  { categoryCount: 4, columnCount: 5, foundationCount: 4 },
  { categoryCount: 5, columnCount: 6, foundationCount: 4 },
  { categoryCount: 6, columnCount: 6, foundationCount: 4 },
  { categoryCount: 7, columnCount: 7, foundationCount: 4 },
  { categoryCount: 8, columnCount: 7, foundationCount: 3 },
  { categoryCount: 9, columnCount: 8, foundationCount: 3 },
  { categoryCount: 10, columnCount: 8, foundationCount: 3 },
];

export function levelConfig(level: number): LevelConfig {
  const index = Math.min(Math.max(Math.floor(level), 1), CURVE.length) - 1;
  const config = CURVE[index];
  if (
    config === undefined ||
    config.columnCount > TABLEAU_IDS.length ||
    config.foundationCount > FOUNDATION_IDS.length
  ) {
    throw new Error(`level curve entry ${index} exceeds the board's pile universe`);
  }
  return config;
}
