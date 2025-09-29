import './styles.css';
// Mark JS-ready early to allow CSS transitions instead of display:none gates
document.body.classList.add('js-ready');
// Initialize SEO head tags and structured data
import { initSEO } from './seo.ts';
initSEO({
  canonical: 'https://www.danicallero.es/',
  twitterCard: 'summary_large_image',
  imageUrl: 'https://www.danicallero.es/og-image.png?v=1',
  imageAlt: 'Daniel Callero — danicallero',
});
import { typeText } from './modules/typing.ts';
import { animateRetractionToDot, arcToCharTop, playfulCourage, jumpToStaticDotAndReveal } from './modules/motion.ts';
import { setupInfoUI } from './modules/ui.ts';

const NAME = 'danicallero';

async function run() {
  const title = document.getElementById('title') as HTMLElement;
  const nameEl = document.getElementById('name') as HTMLElement;
  const cursorEl = document.getElementById('cursor') as HTMLElement;
  const dotStatic = document.getElementById('dotStatic') as HTMLElement;
  const esEl = document.getElementById('es') as HTMLElement;
  const infoBtn = document.getElementById('info-btn') as HTMLButtonElement;

  if (!title || !nameEl || !cursorEl || !dotStatic || !esEl || !infoBtn) return;

  // Initialize
  nameEl.textContent = '';
  cursorEl.classList.remove('typing-done');
  infoBtn.classList.add('hidden');

  // Start typing after a short pause
  await new Promise((res) => setTimeout(res, 700));
  await typeText({ nameEl, cursorEl, text: NAME, minDelay: 70, maxDelay: 120 });

  // Morph cursor to a dot by shrinking upward
  const dotPx = measureDotDiameterPx(nameEl);
  const retractState = await animateRetractionToDot({ cursorEl, nameEl, dotDiameter: dotPx, duration: 800 });

  // Parabolic arc: land on top of last letter (index NAME.length - 1)
  const lastIndex = NAME.length - 1;
  await arcToCharTop({
    title,
    nameEl,
    cursorEl,
    charIndex: lastIndex,
    dotDiameter: dotPx,
    duration: 900,
    initialVy: retractState.vy
  });

  // Playful mini hop (quick), then go for the final jump immediately
  await playfulCourage({ cursorEl, dotDiameter: dotPx, attempts: 1, duration: 450 });

  // Final jump: land where the real '.' will live, then reveal '.' and "es"
  await jumpToStaticDotAndReveal({ title, cursorEl, dotStatic, esEl, dotDiameter: dotPx, duration: 900 });

  // Enable UI after the intro
  setupInfoUI();
  infoBtn.classList.remove('hidden');
}

function measureDotDiameterPx(refEl: HTMLElement): number {
  const style = getComputedStyle(refEl);
  const temp = document.createElement('span');
  temp.textContent = '.';
  temp.style.visibility = 'hidden';
  temp.style.position = 'absolute';
  temp.style.fontFamily = style.fontFamily;
  temp.style.fontSize = style.fontSize;
  document.body.appendChild(temp);
  const rect = temp.getBoundingClientRect();
  document.body.removeChild(temp);
  // Use the measured dot width directly for resolution-independent scaling
  return rect.width;
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
