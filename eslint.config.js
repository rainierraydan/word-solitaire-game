import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
  },
  {
    // Architecture invariant: game logic is pure — no DOM, no UI imports.
    files: ['src/game/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'src/game must not access the DOM.' },
        { name: 'document', message: 'src/game must not access the DOM.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/ui/**', '**/ui'], message: 'src/game must not import from src/ui.' },
          ],
        },
      ],
    },
  },
);
