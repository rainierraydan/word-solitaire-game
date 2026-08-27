const app = document.querySelector('#app');
if (!(app instanceof HTMLElement)) {
  throw new Error('Missing #app root element');
}
