/** Short, non-punishing invalid-move feedback. */
export function shake(el: HTMLElement): void {
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation when re-shaking the same element
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}
