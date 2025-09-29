/*
Tweaking guide 
---------------------------------------
Core alignment
- oLanding.offsetXEm: horizontal nudge on the "o" landing (±0.002–0.02)
- oLanding.offsetYEm: vertical nudge on the "o" landing (±0.01 steps). Negative = higher
- dotLanding.offsetYEm: vertical nudge for the final dot (±0.004)

Feel / physics
- gravity.arcToO: 0.0027–0.0033 (lower = floatier arc to the o)
- gravity.jump:   0.0027–0.0033 (lower = floatier final jump)
- elasticity.oBounceFactor: 0.5–0.65 (how peppy the final jump is)

Trajectory model per phase
- trajectory.arc.mode: 'ballistic' (uses shrink inertia, recommended) or 'bezier'
- trajectory.jump.mode: 'ballistic' or 'bezier' (bezier gives a stylable curve)
- For bezier, tune tPeak (0..1) and apex*Em (vertical/horizontal apex shifts)

Responsive (optional)
- responsive.breakpointPx: width <= this OR portrait → apply responsive scales
- responsive.arcToO.gravityScale: multiply gravity on phones/portrait to widen arc
- responsive.jump.gravityScale / peakHScale: shape final jump on phones/portrait

Notes
- All *Em values scale with font-size; prefer them over px for consistency.
- Set the entire `responsive` block to undefined/null to disable responsive tweaks.
*/

export interface ResponsiveDiscrete {
  breakpointPx: number;
  arcToO?: { gravityScale?: number };
  jump?: { gravityScale?: number; peakHScale?: number };
}

export interface ScaleRange { min: number; max: number }
export interface ResponsiveContinuous {
  widthPx: { min: number; max: number };
  arcToO?: { gravityScale?: ScaleRange };
  jump?: {
    gravityScale?: ScaleRange;
    peakHScale?: ScaleRange;
  };
}

export interface TrajectoryPhase {
  mode: 'ballistic' | 'bezier';
  tPeak?: number;
  apexXEm?: number;
  apexYEm?: number;
}

export interface MotionConfigShape {
  cursor: { offsetXEm?: number; offsetYEm?: number };
  oLanding: { offsetX?: number; offsetY?: number; offsetXEm?: number; offsetYEm?: number };
  dotLanding: { offsetX?: number; offsetY?: number; offsetXEm?: number; offsetYEm?: number };
  gravity: { arcToO: number; jump: number };
  elasticity: { oBounceFactor?: number };
  responsive?: ResponsiveDiscrete | null;
  responsiveContinuous?: ResponsiveContinuous | null;
  trajectory: { arc: TrajectoryPhase; jump: TrajectoryPhase };
}

export const MotionConfig: MotionConfigShape = {
  // Caret/cursor visual nudge during typing (em-based for consistency)
  cursor: {
    offsetXEm: 0.1, // shift a little to the right; tune 0.01–0.04
    offsetYEm: -0.05, // raise slightly; negative = higher (0.005–0.02 typical)
  },
  // Fine-tune landing alignment per font/rendering
  oLanding: {
    offsetX: 0,   // px (unused when *Em provided)
    offsetY: 0,   // px (unused when *Em provided)
    // Em-based offsets (preferred for resolution independence)
    offsetXEm: 0.05, // ~ -0.6px at 64px font, scales with size
    offsetYEm: -0.15, // raised slightly higher on the 'o'
  },
  dotLanding: {
    offsetX: 0,   // px (unused when *Em provided)
    offsetY: 0,   // px (unused when *Em provided)
    // Em-based offsets
    offsetXEm: 0,
    offsetYEm: -0.016, // ~ -1px at 64px font
  },
  gravity: {
    arcToO: 0.003,   // px/ms^2
    jump: 0.003,     // px/ms^2
  },
  elasticity: {
    oBounceFactor: 0.58, // scales impact speed to jump-up speed
  },
  // Responsive tuning for smaller/portrait screens (set to null to disable)
  responsive: {
    breakpointPx: 640, // treat as phone/portrait when width <= this or orientation is portrait
    arcToO: { gravityScale: 0.88 },
    jump:   { gravityScale: 0.82, peakHScale: 1.15 },
  },
  // Continuous, width-based responsive tuning (preferred).
  // Interpolates linearly between min..max screen widths.
  // If provided, this takes precedence over the discrete `responsive` block above.
  responsiveContinuous: {
    widthPx: { min: 360, max: 1440 },
    arcToO: {
      gravityScale: { min: 0.86, max: 1.0 }, // smaller screens → slightly floatier (wider arc)
    },
    jump: {
      gravityScale: { min: 0.82, max: 1.0 },
      peakHScale:   { min: 1.12, max: 1.0 }, // a touch more height on smaller screens
      // Optional bezier shaping ranges, only used when trajectory.jump.mode === 'bezier'
      // bezier: {
      //   apexYEm: { min: -1.05, max: -0.90 },
      //   tPeak:   { min: 0.50,  max: 0.45 },
      // },
    },
  },
  // Trajectory model per phase
  trajectory: {
    arc:  { mode: 'ballistic', tPeak: 0.38, apexXEm: 0.06, apexYEm: -0.60 },
    jump: { mode: 'bezier',    tPeak: 0.45, apexXEm: 0.00, apexYEm: -0.90 },
  },
};
