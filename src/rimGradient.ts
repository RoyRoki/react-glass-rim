// Pure conic-gradient math for the rim / glass-edge effect (no React, no DOM).
// `useRimEffect` masks the returned background to a thin border strip on the host.
//
// This module is framework-agnostic and side-effect free — you can call
// `buildGradient` directly if you want to render the rim with your own renderer.

// ── Default colours ──────────────────────────────────────────────────────────
// The rim is a white glass highlight by default. Both can be overridden per call
// (the hook/component derive these from `accentColor` + `intensity`).
export const RIM_ACCENT = "rgba(255,255,255,0.30)";
// Fallback shadow endpoint for BORDERED hosts: transparent WHITE (not black, so
// the fade never tints the ramp grey). Reveals the border pixel (border blend);
// borderless hosts pass their surface colour so shadow zones melt into the card.
export const RIM_SHADOW = "rgba(255,255,255,0)";

const DEG = 180 / Math.PI;

// Below this short side the directional rim can't render a soft fade (a thin
// element crams the ramp into a fraction of a degree near the 90°/270° ends,
// reading as a boxy corner). Such elements get a uniform rim instead.
const RIM_MIN_DIM = 12; // px

// ── Flat mode (cards, pills, panels) ─────────────────────────────────────────
// Shadow extent is in PHYSICAL PIXELS from the corner (degree windows smear).
const FLAT_SHADOW_LEN = 8; // px of full (max-dark) shadow each side of corner
const FLAT_SHADOW_RAMP = 20; // px of accent→shadow fade beyond the shadow
// Shadow + ramp never pass this fraction of an edge's half-length ("corner only",
// never the side). Also sizes the shadow on SHORT elements (small pills, stat
// cards) — it only binds when scaled, so big cards (scale 1) stay untouched.
const FLAT_MAX_FRAC = 0.6;

// Shadow + ramp extents (px) for one edge, scaled down proportionally (fixed
// ratio) on short edges so the fade is always present, never a hard line.
function edgeExtents(half: number, maxFrac: number) {
  const total = FLAT_SHADOW_LEN + FLAT_SHADOW_RAMP;
  const scale = Math.min(1, (half * maxFrac) / total);
  return { shadow: FLAT_SHADOW_LEN * scale, ramp: total * scale };
}

// ── Circular mode (genuinely round elements) ─────────────────────────────────
// Glass highlight: bright arc at TL + BR, shadow at TR + BL.
const CIRC_LIT_HALF = 45; // lit degrees each side of TL / BR corner centre
const CIRC_LIT_RAMP = 22; // ramp for a smoother fade in/out
const CIRC_MIN = 35; // cornerDeg range allowing circular mode
const CIRC_MAX = 55; // (35°–55° ≈ aspect ratio 0.7–1.43)
// Round only when radius reaches this fraction of the short half-dimension.
// Circular mode places its shadow by ANGLE, which smears near a 45° corner —
// fine on a circle, wrong on a rounded square (→ flat).
const CIRC_ROUND_RATIO = 0.75;

// Conic angle (deg, from 12 o'clock clockwise) of (right px, up px) from centre.
function conicAngle(right: number, up: number): number {
  return Math.atan2(right, up) * DEG;
}

type Build = (shadow: string, accent: string) => string;

function flat(w: number, h: number, maxFrac: number): Build {
  const a = w / 2; // half-width  → centre→corner distance along the top edge
  const b = h / 2; // half-height → centre→corner distance along the side edge
  const top = edgeExtents(a, maxFrac);
  const side = edgeExtents(b, maxFrac);
  // TR corner is at conicAngle(a, b); the top edge lowers the angle, the right
  // edge raises it. BL corner (the +180 stops) is the exact 180° mirror.
  const a0 = conicAngle(a - top.ramp, b); // ramp begins (accent side, top edge)
  const a1 = conicAngle(a - top.shadow, b); // full shadow begins
  const a2 = conicAngle(a, b - side.shadow); // full shadow ends (right edge)
  const a3 = conicAngle(a, b - side.ramp); // ramp ends, back to accent
  return (shadow, accent) =>
    conic([
      `${accent} 0deg`,
      `${accent} ${a0}deg`,
      `${shadow} ${a1}deg`,
      `${shadow} ${a2}deg`,
      `${accent} ${a3}deg`,
      `${accent} ${a0 + 180}deg`,
      `${shadow} ${a1 + 180}deg`,
      `${shadow} ${a2 + 180}deg`,
      `${accent} ${a3 + 180}deg`,
      `${accent} 360deg`,
    ]);
}

function circular(cornerDeg: number): Build {
  const br = 90 + cornerDeg; // bottom-right lit corner
  const tl = 270 + cornerDeg; // top-left lit corner
  const brS0 = br - CIRC_LIT_HALF - CIRC_LIT_RAMP;
  const brS1 = br - CIRC_LIT_HALF;
  const brS2 = br + CIRC_LIT_HALF;
  const brS3 = br + CIRC_LIT_HALF + CIRC_LIT_RAMP;
  const tlS0 = tl - CIRC_LIT_HALF - CIRC_LIT_RAMP;
  const tlS1 = tl - CIRC_LIT_HALF;
  const tlS2 = tl + CIRC_LIT_HALF;
  const tlS3 = tl + CIRC_LIT_HALF + CIRC_LIT_RAMP;
  return (shadow, accent) =>
    // TL zone may wrap past 360° for tall-ish shapes near the upper limit.
    tlS3 > 360
      ? conic([
          `${accent} 0deg`,
          `${accent} ${tlS2 - 360}deg`,
          `${shadow} ${tlS3 - 360}deg`,
          `${shadow} ${brS0}deg`,
          `${accent} ${brS1}deg`,
          `${accent} ${brS2}deg`,
          `${shadow} ${brS3}deg`,
          `${shadow} ${tlS0}deg`,
          `${accent} ${tlS1}deg`,
          `${accent} 360deg`,
        ])
      : conic([
          `${shadow} 0deg`,
          `${shadow} ${brS0}deg`,
          `${accent} ${brS1}deg`,
          `${accent} ${brS2}deg`,
          `${shadow} ${brS3}deg`,
          `${shadow} ${tlS0}deg`,
          `${accent} ${tlS1}deg`,
          `${accent} ${tlS2}deg`,
          `${shadow} ${tlS3}deg`,
          `${shadow} 360deg`,
        ]);
}

function conic(stops: string[]): string {
  return `conic-gradient(from 0deg at 50% 50%, ${stops.join(", ")})`;
}

// Gradient for a host of size w×h, corner radius r. `shadow` = colour the shadow
// zones fade to; `accent` = the lit colour (varied per ring for a radial fade);
// `shadowScale` > 1 grows the corner shadow on SHORT elements (small pills).
export function buildGradient(
  w: number,
  h: number,
  r: number,
  shadow: string,
  accent: string = RIM_ACCENT,
  shadowScale = 1,
): string {
  // Too thin for a directional rim — uniform accent that follows the round shape.
  if (Math.min(w, h) < RIM_MIN_DIM)
    return `linear-gradient(${accent}, ${accent})`;

  const cornerDeg = Math.atan2(h, w) * DEG;
  const roundness = r / (Math.min(w, h) / 2); // 1 ⇒ circle/pill; small ⇒ square
  const isRound =
    roundness >= CIRC_ROUND_RATIO &&
    cornerDeg >= CIRC_MIN &&
    cornerDeg <= CIRC_MAX;
  const maxFrac = Math.min(1, FLAT_MAX_FRAC * shadowScale);
  const build = isRound ? circular(cornerDeg) : flat(w, h, maxFrac);
  return build(shadow, accent);
}
