import { createBoard } from './ui/board';

const app = document.querySelector('#app');
if (!(app instanceof HTMLElement)) {
  throw new Error('Missing #app root element');
}
createBoard(app);
