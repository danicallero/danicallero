import { MotionConfig } from '../config';

export function animateRetractionToDot(opts: {
  cursorEl: HTMLElement;
  nameEl: HTMLElement;
  dotDiameter: number;
  duration: number;
}): Promise<{ left: number; top: number; vy: number }>
{
  const { cursorEl, nameEl, dotDiameter, duration } = opts;
  return new Promise((resolve) => {
    // We'll animate pixel top for correct chaining; only use scaleY in transform
    let start: number | null = null;
    const style = getComputedStyle(nameEl);
    const em = parseFloat(style.fontSize) || 16;
    const baseTop = parseFloat(cursorEl.style.top) || 0;
    const caretLeft = parseFloat(cursorEl.style.left) || 0; // caret x from typing
    let lastYPx = baseTop;
    let lastT = 0;

    function frame(t: number) {
      if (start == null) start = t;
      const p = Math.min((t - start) / duration, 1);
      // Ease-in upward (accelerate upwards)
      const ease = p * p;
      const yOffsetPx = -0.8 * em * ease; // upward negative
      const currentTop = baseTop + yOffsetPx;

      if (p < 0.7) {
        const width = 2 - (1.8 * ease);
        cursorEl.style.width = `${Math.max(0.3, width)}px`;
        cursorEl.style.height = `${em}px`;
        cursorEl.style.top = `${currentTop}px`;
        cursorEl.style.transform = `scaleY(${1 - 0.95 * ease})`;
        cursorEl.style.borderRadius = '0%';
        cursorEl.style.opacity = '0.9';
        // Keep horizontally centered on the caret as width changes
        const w = Math.max(0.3, width);
        cursorEl.style.left = `${caretLeft - w / 2}px`;
      } else {
        const k = (p - 0.7) / 0.3;
        const size = 2 + k * (dotDiameter - 2);
        cursorEl.style.width = `${size}px`;
        cursorEl.style.height = `${size}px`;
        cursorEl.style.top = `${currentTop}px`;
        cursorEl.style.transform = 'none';
        cursorEl.style.borderRadius = '50%';
        cursorEl.style.opacity = '1';
        // Keep dot centered at caret during morphing
        cursorEl.style.left = `${caretLeft - size / 2}px`;
      }

      if (lastT) {
        const vy = (currentTop - lastYPx) / (t - lastT); // px/ms (negative means up)
        (cursorEl as any)._vy = vy;
      }
      lastYPx = currentTop; lastT = t;

      if (p < 1) requestAnimationFrame(frame); else {
        const left = parseFloat(cursorEl.style.left) || (caretLeft - (dotDiameter / 2));
        const top = parseFloat(cursorEl.style.top) || 0;
        const vy = (cursorEl as any)._vy ?? 0;
        resolve({ left, top, vy });
      }
    }
    requestAnimationFrame(frame);
  });
}

export function arcToCharTop(opts: {
  title: HTMLElement;
  nameEl: HTMLElement;
  cursorEl: HTMLElement;
  charIndex: number;
  dotDiameter: number;
  duration?: number;
  initialVy?: number; // px/ms from retraction (negative going up)
}) {
  const { title, nameEl, cursorEl, charIndex, dotDiameter } = opts;
  const duration = opts.duration ?? 900;
  const initialVy = opts.initialVy ?? 0;
  return new Promise<void>((resolve) => {
    // Compute the exact bounding rect for the target character
    const textNode = nameEl.firstChild as Text | null;
    const titleRect = title.getBoundingClientRect();
    if (!textNode) { resolve(); return; }
  const rng = document.createRange();
  rng.setStart(textNode, charIndex);
  rng.setEnd(textNode, Math.min(charIndex + 1, (textNode.textContent ?? '').length));
  const charRect = rng.getBoundingClientRect();
  // Compute caret positions at char boundaries to get a stable center X across resolutions
  const rStart = document.createRange();
  rStart.setStart(textNode, charIndex);
  rStart.setEnd(textNode, charIndex);
  const rs = rStart.getClientRects()[0] || charRect;
  const rEnd = document.createRange();
  rEnd.setStart(textNode, Math.min(charIndex + 1, (textNode.textContent ?? '').length));
  rEnd.setEnd(textNode, Math.min(charIndex + 1, (textNode.textContent ?? '').length));
  const re = rEnd.getClientRects()[0] || charRect;

    // Compute actual ink height for 'o' using canvas metrics to refine top placement
    const style = getComputedStyle(nameEl);
    const fontPx = parseFloat(style.fontSize) || 16;
    const fontSpec = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${fontPx}px ${style.fontFamily}`.trim();
    const metrics = measureGlyph('o', fontSpec);
    const actualHeight = (metrics.actualBoundingBoxAscent ?? 0) + (metrics.actualBoundingBoxDescent ?? 0);

  // Support resolution-independent offsets (em) with px fallback
  const offXpx = (MotionConfig.oLanding.offsetXEm != null)
    ? MotionConfig.oLanding.offsetXEm * fontPx
    : (MotionConfig.oLanding.offsetX || 0);
  const offYpx = (MotionConfig.oLanding.offsetYEm != null)
    ? MotionConfig.oLanding.offsetYEm * fontPx
    : (MotionConfig.oLanding.offsetY || 0);
  // Center X based on glyph bounding box, with micro offset
  const x0 = rs.left - titleRect.left;
  const x1 = re.left - titleRect.left;
  const targetCenterX = (isFinite(x0) && isFinite(x1) && x1 !== x0)
    ? (x0 + x1) / 2 + offXpx
    : (charRect.left - titleRect.left + charRect.width / 2 + offXpx);
  const targetLeft = targetCenterX - dotDiameter / 2;
  // Compute ink top and rest the dot on top of the glyph (bottom of dot touches ink top)
  const inkTop = (charRect.bottom - titleRect.top) - actualHeight;
  // Keep the dot just touching or slightly above the ink top.
  // We avoid a positive cushion to prevent visual overlap.
  const contactFudge = 0; // was positive; set to 0 to avoid base crossing
  const targetTop = inkTop - dotDiameter + contactFudge + offYpx;

    const startLeft = parseFloat(cursorEl.style.left) || 0;
    const startTop = parseFloat(cursorEl.style.top) || 0;

  // Physics: vertical motion with gravity and initial velocity; stop exactly when we touch targetTop
  const traj = MotionConfig.trajectory;
  let g = MotionConfig.gravity.arcToO; // px/ms^2
  // Continuous responsive scaling over viewport width
  try {
    const w = window.innerWidth;
  const rc = MotionConfig.responsiveContinuous as any;
    if (rc && rc.widthPx) {
      const t = clamp01((w - rc.widthPx.min) / Math.max(1, (rc.widthPx.max - rc.widthPx.min)));
      const gs = rc.arcToO?.gravityScale;
      if (gs && isFinite(gs.min) && isFinite(gs.max)) {
        const s = lerp(gs.min, gs.max, t);
        g *= s;
      }
    } else {
      // Fallback to discrete responsive if present
      const isPortrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
  const resp = MotionConfig.responsive as any;
      if (resp && (isPortrait || w <= (resp.breakpointPx || 640))) {
        const scale = (resp.arcToO && resp.arcToO.gravityScale) || 1;
        g *= scale;
      }
    }
  } catch {}
    const a = 0.5 * g;
    const b = initialVy;
    const c = startTop - targetTop;
    let T = duration;
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const t1 = (-b + Math.sqrt(disc)) / (2 * a);
      const t2 = (-b - Math.sqrt(disc)) / (2 * a);
      const candidates = [t1, t2].filter((x) => x > 200 && x < 2000);
      if (candidates.length) T = Math.min(...candidates);
    }

  // Trajectory: ballistic or bezier (per-phase)
  const mode = (traj && traj.arc && traj.arc.mode) || 'ballistic';
  const vx0 = (targetLeft - startLeft) / T;

    let start: number | null = null;
    function frame(t: number) {
      if (start == null) start = t;
      const elapsed = Math.min(t - start, T);
      const p = elapsed / T;
      let x: number; let y: number; let vy: number;
      if (mode === 'bezier') {
        // Quadratic bezier with control point near the desired apex
        const fontPxLocal = parseFloat(style.fontSize) || 16;
        const ctrlShiftX = ((traj.arc && traj.arc.apexXEm) ?? 0) * fontPxLocal;
        const ctrlShiftY = ((traj.arc && traj.arc.apexYEm) ?? -0.6) * fontPxLocal;
        const tPeak = (traj.arc && traj.arc.tPeak) ?? 0.38;
        const cx = startLeft + (targetLeft - startLeft) * tPeak + ctrlShiftX;
        const cy = startTop + (targetTop - startTop) * tPeak + ctrlShiftY;
        // Quadratic Bezier interpolation
        const u = 1 - p;
        x = u * u * startLeft + 2 * u * p * cx + p * p * targetLeft;
        y = u * u * startTop + 2 * u * p * cy + p * p * targetTop;
        // Approximate vy from derivative for landing check
        const dydt = 2 * (u * (cy - startTop) + p * (targetTop - cy)) / T;
        vy = dydt;
      } else {
        y = startTop + initialVy * elapsed + 0.5 * g * elapsed * elapsed;
        vy = initialVy + g * elapsed;
        x = startLeft + vx0 * elapsed;
      }

      // If descending and we reached targetTop early due to numeric drift, clamp smoothly at current x
      if (vy > 0 && y >= targetTop && elapsed < T) {
        // Snap to exact target left (centerX - radius) to avoid horizontal drift
        cursorEl.style.left = `${targetLeft}px`;
        cursorEl.style.top = `${targetTop}px`;
        (cursorEl as any)._impactVy = vy;
        cursorEl.style.width = `${dotDiameter}px`;
        cursorEl.style.height = `${dotDiameter}px`;
        cursorEl.style.borderRadius = '50%';
        cursorEl.style.opacity = '1';
        // Jelly elastic squash on landing (anchor bottom at contact)
        jellySquash(cursorEl, dotDiameter, { anchorBottom: true }).then(() => resolve());
        return;
      }

      cursorEl.style.left = `${x}px`;
      cursorEl.style.top = `${y}px`;
  // Slight compression as it lands
  const compress = Math.max(0, Math.min(1, (p - 0.9) / 0.1));
  const height = dotDiameter * (1 - 0.05 * compress);
  const width = dotDiameter * (1 + 0.03 * compress);
  cursorEl.style.width = `${width}px`;
  cursorEl.style.height = `${height}px`;
      cursorEl.style.borderRadius = '50%';
      cursorEl.style.opacity = '1';

      if (elapsed < T) requestAnimationFrame(frame); else {
        // Snap exactly to target and record impact velocity for next phase
        cursorEl.style.left = `${targetLeft}px`;
        cursorEl.style.top = `${targetTop}px`;
        (cursorEl as any)._impactVy = (mode === 'bezier') ? (0.02) : (initialVy + g * T); // small positive
        cursorEl.style.width = `${dotDiameter}px`;
        cursorEl.style.height = `${dotDiameter}px`;
        // Jelly elastic squash on landing (anchor bottom at contact)
        jellySquash(cursorEl, dotDiameter, { anchorBottom: true }).then(() => resolve());
      }
    }
    requestAnimationFrame(frame);
  });
}

function measureGlyph(char: string, font: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 } as TextMetrics;
  ctx.font = font;
  // Using measureText gives us actualBoundingBox* in modern browsers
  const m = ctx.measureText(char);
  return m;
}

export function playfulCourage(opts: { cursorEl: HTMLElement; dotDiameter: number; attempts: number; duration: number; }) {
  const { cursorEl } = opts;
  return new Promise<void>(async (resolve) => {
    // Use arcToO gravity scaled up for a quick hop (no separate config needed)
    const g = MotionConfig.gravity.arcToO * 1.4; // stronger gravity for quick hop
    for (let i = 0; i < opts.attempts; i++) {
      await new Promise<void>((res) => {
        const top0 = parseFloat(cursorEl.style.top) || 0;
        const vy0 = -0.35; // small impulse upwards
        let start: number | null = null;
        function frame(t: number) {
          if (start == null) start = t;
          const elapsed = t - start;
          const y = top0 + vy0 * elapsed + 0.5 * g * elapsed * elapsed;
          if (y >= top0) { cursorEl.style.top = `${top0}px`; res(); return; }
          cursorEl.style.top = `${y}px`;
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      await sleep(120);
    }
    resolve();
  });
}

export function jumpToStaticDotAndReveal(opts: {
  title: HTMLElement;
  cursorEl: HTMLElement;
  dotStatic: HTMLElement;
  esEl: HTMLElement;
  dotDiameter: number;
  duration: number;
}) {
  const { title, cursorEl, dotStatic, esEl, dotDiameter, duration } = opts;
  return new Promise<void>((resolve) => {
    const titleRect = title.getBoundingClientRect();
    const dotRect = dotStatic.getBoundingClientRect();
    // Use the font size from the static dot's parent for consistent em-based offsets
    const dotContainer = dotStatic.parentElement ?? title;
    const nameStyle = getComputedStyle(dotContainer);
    const fontPx = parseFloat(nameStyle.fontSize) || 16;
    const dotOffX = (MotionConfig.dotLanding.offsetXEm != null)
      ? MotionConfig.dotLanding.offsetXEm * fontPx
      : (MotionConfig.dotLanding.offsetX || 0);
    const dotOffY = (MotionConfig.dotLanding.offsetYEm != null)
      ? MotionConfig.dotLanding.offsetYEm * fontPx
      : (MotionConfig.dotLanding.offsetY || 0);
    // Center-to-center alignment to avoid resolution variance
    const dotCenterX = (dotRect.left - titleRect.left) + dotRect.width / 2 + dotOffX;
    const dotCenterY = (dotRect.top - titleRect.top) + dotRect.height / 2 + dotOffY;
    const targetLeft = dotCenterX - dotDiameter / 2;
    const targetTop = dotCenterY - dotDiameter / 2;
    const startLeft = parseFloat(cursorEl.style.left) || 0;
    const startTop = parseFloat(cursorEl.style.top) || 0;

    // Deterministic parabola: choose vy0 (prefer continuity from impact if available), compute T to hit target, then vx0
  const traj = MotionConfig.trajectory;
  let g = MotionConfig.gravity.jump;
  // Responsive: width-based continuous scaling (preferred), fallback to discrete
  let peakScale = 1;
  try {
    const w = window.innerWidth;
  const rc = MotionConfig.responsiveContinuous as any;
    if (rc && rc.widthPx) {
      const t = clamp01((w - rc.widthPx.min) / Math.max(1, (rc.widthPx.max - rc.widthPx.min)));
      const gs = rc.jump?.gravityScale; const ps = rc.jump?.peakHScale;
      if (gs && isFinite(gs.min) && isFinite(gs.max)) g *= lerp(gs.min, gs.max, t);
      if (ps && isFinite(ps.min) && isFinite(ps.max)) peakScale = lerp(ps.min, ps.max, t);
    } else {
      const isPortrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
  const resp = MotionConfig.responsive as any;
      if (resp && (isPortrait || w <= (resp.breakpointPx || 640))) {
        if (resp.jump && resp.jump.gravityScale) g *= resp.jump.gravityScale;
        if (resp.jump && resp.jump.peakHScale) peakScale = resp.jump.peakHScale;
      }
    }
  } catch {}
  let peakH = Math.max(8, dotDiameter * 0.7) * peakScale; // px above startTop
    // Continuity: use previous recorded impactVy (downward +) to bounce upward
    const impactVy = (cursorEl as any)._impactVy as number | undefined;
    const bounceVy = (impactVy != null) ? -Math.abs(impactVy) * (MotionConfig.elasticity.oBounceFactor ?? 0.5) : undefined;
  let vy0 = bounceVy ?? -Math.sqrt(2 * g * peakH); // if no impact, fall back to peak-based
    // Ensure a minimum upward impulse
    if (!isFinite(vy0) || vy0 >= -0.08) vy0 = -Math.sqrt(2 * g * peakH);
    let c = startTop - targetTop;              // y0 - yt
    let disc = vy0 * vy0 - 2 * g * c;
    // ensure solution exists; if not, reduce peakH progressively
    let guard = 0;
    while (disc < 0 && guard++ < 3) {
      peakH *= 0.7;
      vy0 = -Math.sqrt(2 * g * Math.max(1, peakH));
      disc = vy0 * vy0 - 2 * g * c;
    }
  let T = (disc >= 0) ? (-vy0 + Math.sqrt(disc)) / g : (duration);
  // Clamp T to a reasonable window
  T = Math.max(280, Math.min(1200, T));
  const mode = (traj && traj.jump && traj.jump.mode) || 'ballistic';
  const vx0 = (targetLeft - startLeft) / T;

    cursorEl.style.transform = 'none';
    let t0: number | null = null;
    function step(ts: number) {
      if (t0 == null) t0 = ts;
      const elapsed = ts - t0; // ms
      const clamped = Math.min(elapsed, T);
      let x: number; let y: number;
      if (mode === 'bezier') {
        const nameStyle2 = getComputedStyle(dotContainer);
        const fontPx2 = parseFloat(nameStyle2.fontSize) || 16;
        const ctrlShiftX = ((traj.jump && traj.jump.apexXEm) ?? 0) * fontPx2;
        const ctrlShiftY = ((traj.jump && traj.jump.apexYEm) ?? -0.9) * fontPx2;
        const cx = startLeft + (targetLeft - startLeft) * ((traj.jump && traj.jump.tPeak) ?? 0.45) + ctrlShiftX;
        const cy = startTop + (targetTop - startTop) * ((traj.jump && traj.jump.tPeak) ?? 0.45) + ctrlShiftY;
        const p = clamped / T; const u = 1 - p;
        x = u * u * startLeft + 2 * u * p * cx + p * p * targetLeft;
        y = u * u * startTop + 2 * u * p * cy + p * p * targetTop;
      } else {
        x = startLeft + vx0 * clamped;
        y = startTop + vy0 * clamped + 0.5 * g * clamped * clamped;
      }

      cursorEl.style.left = `${x}px`;
      cursorEl.style.top = `${y}px`;
      cursorEl.style.width = `${dotDiameter}px`;
      cursorEl.style.height = `${dotDiameter}px`;
      cursorEl.style.borderRadius = '50%';
      cursorEl.style.opacity = '1';

      if (elapsed < T) { requestAnimationFrame(step); }
      else {
        // Land exactly at the target and reveal the real '.'
        cursorEl.style.left = `${targetLeft}px`;
        cursorEl.style.top = `${targetTop}px`;
        cursorEl.style.display = 'none';
        dotStatic.style.opacity = '1';
        const baseScale = 1; let sStart: number | null = null;
        function settle(ts2: number) {
          if (sStart == null) sStart = ts2;
          const q = Math.min((ts2 - sStart) / 220, 1);
          const bounce = Math.sin(q * Math.PI * 2) * 0.05 * (1 - q);
          const scale = baseScale + bounce;
          dotStatic.style.display = 'inline-block';
          (dotStatic as HTMLElement).style.transform = `scale(${scale})`;
          if (q < 1) requestAnimationFrame(settle); else { revealEs(esEl).then(() => resolve()); }
        }
        requestAnimationFrame(settle);
      }
    }
    requestAnimationFrame(step);
  });
}

function jellySquash(el: HTMLElement, d: number, opts?: { anchorBottom?: boolean }) {
  return new Promise<void>((resolve) => {
    const duration = 220;
    let start: number | null = null;
    function frame(t: number) {
      if (start == null) start = t;
      const p = Math.min((t - start) / duration, 1);
      // Stronger yet short damped oscillation
      const damp = Math.exp(-2.2 * p);
      const osc = Math.sin(p * Math.PI * 3.5) * 0.28 * damp; // increased amplitude
      const height = d * (1 - osc);
      const width = d * (1 + osc * 0.7);

      // Preserve bottom contact by adjusting top when height changes
      if (opts?.anchorBottom) {
        const bottom = (parseFloat(el.style.top) || 0) + (parseFloat(el.style.height) || d);
        el.style.height = `${height}px`;
        el.style.top = `${bottom - height}px`;
        // Keep horizontally centered as width changes
        const leftCenter = (parseFloat(el.style.left) || 0) + (parseFloat(el.style.width) || d) / 2;
        el.style.width = `${width}px`;
        el.style.left = `${leftCenter - width / 2}px`;
      } else {
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
      }
      el.style.borderRadius = '50%';
      if (p < 1) requestAnimationFrame(frame); else {
        el.style.width = `${d}px`;
        el.style.height = `${d}px`;
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

function revealEs(esEl: HTMLElement) {
  return new Promise<void>((resolve) => {
    let start: number | null = null;
    function frame(t: number) {
      if (start == null) start = t;
      const p = Math.min((t - start) / 500, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      const x = lerp(-5, 0, ease);
      esEl.style.transform = `translateX(${x}px)`;
      esEl.style.opacity = `${ease}`;
      if (p < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
