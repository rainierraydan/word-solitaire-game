import type { Card, CardId } from '../game/state';
import './card.css';

/**
 * One element per deck card, created once at boot and moved only via
 * transform. The flip is pure CSS, driven by the `face-up` class.
 */
export function createCardElement(card: Card): HTMLElement {
  const el = document.createElement('div');
  el.className = card.kind === 'category' ? 'card category' : 'card';
  el.dataset['cardId'] = card.id;

  const back = document.createElement('div');
  back.className = 'face back';
  const front = document.createElement('div');
  front.className = 'face front';
  front.textContent = card.label;

  el.append(back, front);
  return el;
}

export function createCardElements(cards: Record<CardId, Card>): Map<CardId, HTMLElement> {
  return new Map(Object.values(cards).map((card) => [card.id, createCardElement(card)]));
}
