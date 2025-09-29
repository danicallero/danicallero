export async function typeText(opts: {
  nameEl: HTMLElement;
  cursorEl: HTMLElement;
  text: string;
  minDelay?: number;
  maxDelay?: number;
}) {
  const { nameEl, cursorEl, text } = opts;
  const min = opts.minDelay ?? 70;
  const max = opts.maxDelay ?? 120;

  nameEl.textContent = '';
  cursorEl.classList.remove('typing-done');
  positionCursor(nameEl, cursorEl);

  for (let i = 0; i < text.length; i++) {
    nameEl.textContent = text.slice(0, i + 1);
    positionCursor(nameEl, cursorEl);
    await sleep(rand(min, max));
  }

  cursorEl.classList.add('typing-done');
}

import { MotionConfig } from '../config';

export function positionCursor(nameEl: HTMLElement, cursorEl: HTMLElement) {
  const title = document.getElementById('title') as HTMLElement | null;
  const range = document.createRange();
  if (!title) return;
  if (!nameEl.firstChild) {
    const titleRect = title.getBoundingClientRect();
    const nameRect = nameEl.getBoundingClientRect();
    const fontPx = parseFloat(getComputedStyle(nameEl).fontSize) || 16;
    const dx = (MotionConfig.cursor.offsetXEm ?? 0) * fontPx;
    const dy = (MotionConfig.cursor.offsetYEm ?? 0) * fontPx;
    cursorEl.style.left = `${(nameRect.left - titleRect.left) + dx}px`;
    cursorEl.style.top = `${(nameRect.top - titleRect.top) + dy}px`;
    return;
  }
  range.setStart(nameEl.firstChild, nameEl.textContent?.length ?? 0);
  range.setEnd(nameEl.firstChild, nameEl.textContent?.length ?? 0);
  const rect = range.getClientRects()[0];
  if (rect) {
    const titleRect = title.getBoundingClientRect();
    const fontPx = parseFloat(getComputedStyle(nameEl).fontSize) || 16;
    const dx = (MotionConfig.cursor.offsetXEm ?? 0) * fontPx;
    const dy = (MotionConfig.cursor.offsetYEm ?? 0) * fontPx;
    cursorEl.style.left = `${(rect.left - titleRect.left) + dx}px`;
    cursorEl.style.top = `${(rect.top - titleRect.top) + dy}px`;
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
