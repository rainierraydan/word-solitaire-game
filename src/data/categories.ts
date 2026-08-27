export type Category = { id: string; name: string; words: string[] };

// Development placeholder set — replaced by real content in T-029.
// Uneven word counts are deliberate: any hardcoded per-category count must break.
export const CATEGORIES: Category[] = [
  { id: 'colors', name: 'Colors', words: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'] },
  { id: 'animals', name: 'Animals', words: ['Dog', 'Cat', 'Fox', 'Bear', 'Wolf', 'Horse', 'Owl'] },
  { id: 'fruits', name: 'Fruits', words: ['Mango', 'Papaya', 'Fig', 'Lychee', 'Kiwi'] },
  { id: 'numbers', name: 'Numbers', words: ['One', 'Two', 'Three'] },
  { id: 'shapes', name: 'Shapes', words: ['Circle', 'Square', 'Star', 'Oval'] },
  { id: 'weather', name: 'Weather', words: ['Rain', 'Snow', 'Fog', 'Wind', 'Storm'] },
  { id: 'tools', name: 'Tools', words: ['Hammer', 'Saw', 'Drill', 'Wrench', 'Pliers'] },
];
