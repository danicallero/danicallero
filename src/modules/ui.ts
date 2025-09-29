export function setupInfoUI() {
  const infoBtn = document.getElementById('info-btn') as HTMLButtonElement;
  const infoPanel = document.getElementById('info-panel') as HTMLElement;
  const heroSection = document.querySelector('.hero-section') as HTMLElement;
  // Button text spans are handled purely with CSS; no JS swap needed

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      infoPanel.classList.remove('hidden');
      infoPanel.setAttribute('aria-hidden', 'false');
      heroSection.classList.add('fade-out');
      infoBtn.classList.add('open');
      infoBtn.setAttribute('aria-label', 'Close info');
    } else {
      infoPanel.classList.add('hidden');
      infoPanel.setAttribute('aria-hidden', 'true');
      heroSection.classList.remove('fade-out');
      infoBtn.classList.remove('open');
      infoBtn.setAttribute('aria-label', 'Open info');
    }
  }

  infoBtn.addEventListener('click', toggle);
  // If a separate close button exists in future markup, bind it dynamically
  const maybeClose = document.getElementById('close-btn') as HTMLButtonElement | null;
  if (maybeClose) maybeClose.addEventListener('click', toggle);

  // Scroll navigation (more responsive + touch)
  let acc = 0;
  const threshold = 60; // px accumulated before toggling
  function onWheel(e: WheelEvent) {
    e.preventDefault();
  // accumulate delta and toggle once threshold surpassed
    // Normalize delta across devices (roughly)
    const delta = e.deltaY;
    acc += delta;
    if (Math.abs(acc) >= threshold) {
      if (acc > 0 && !isOpen) toggle();
      else if (acc < 0 && isOpen) toggle();
      acc = 0;
    }
  }
  document.addEventListener('wheel', onWheel, { passive: false });

  // Touch swipe support
  let touchStartY = 0; let touchMoveY = 0; let touchMoved = false;
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY; touchMoveY = touchStartY; touchMoved = false;
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    touchMoveY = e.touches[0].clientY; touchMoved = true;
  }
  function onTouchEnd() {
    if (!touchMoved) return;
    const dy = touchStartY - touchMoveY;
    if (Math.abs(dy) > 30) {
      if (dy > 0 && !isOpen) toggle();
      else if (dy < 0 && isOpen) toggle();
    }
  }
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });

  // Prevent body scroll on iOS when swiping the hero; allow scroll inside panel
  function stopBodyScroll(e: TouchEvent) {
    if (!isOpen) {
      // If panel is closed, prevent page scroll so hero stays fixed
      e.preventDefault();
    } else {
      // If panel is open, only prevent scroll if target is outside the panel or panel cannot scroll further
      const target = e.target as HTMLElement | null;
      if (!infoPanel.contains(target)) {
        e.preventDefault();
      }
    }
  }
  document.addEventListener('touchmove', stopBodyScroll, { passive: false });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const keys = ['Escape', 'ArrowDown', 'ArrowUp', ' ', 'Space'];
    if (keys.includes(e.key) || e.code === 'Space') e.preventDefault();
    switch (e.key) {
      case 'Escape': if (isOpen) toggle(); break;
      case 'ArrowDown':
      case ' ': if (!isOpen) toggle(); break;
      case 'ArrowUp': if (isOpen) toggle(); break;
      case 'i':
      case 'I': if (!e.ctrlKey && !e.metaKey && !e.altKey) toggle(); break;
    }
  });
}
