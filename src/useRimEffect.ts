"use client";
import { type RefObject, useEffect } from "react";
import { buildGradient, RIM_SHADOW } from "./rimGradient";

// The rim is drawn as `steps` concentric rings, `band` px each. A true fade
// across a rounded border can't be done with one CSS gradient (none follows the
// rounded contour inward), so we stack thin rings: the outer ring is brightest
// and the accent alpha fades toward the inner ring, giving an outside→inside
// accent→surface gradient. Total rim thickness = steps * band.

export interface RimOptions {
  /**
   * The host's CSS border thickness (px) so the rim overlays the border exactly.
   * Pass 0 (default) for borderless hosts; their shadow zones then blend into the
   * host's own background colour and track its state changes.
   */
  borderWidth?: number;
  /**
   * > 1 enlarges the corner shadow on SHORT elements (e.g. small day pills) whose
   * shadow is otherwise scaled down hard by the corner cap. Default 1.
   */
  shadowScale?: number;
  /**
   * Gate the rim on/off (e.g. only the active nav item). When it flips, the effect
   * re-runs: layers are appended when enabled, torn down when not. Default true.
   */
  enabled?: boolean;
  /**
   * When > 0, layers start transparent and fade in over this duration once their
   * mask/clip has settled. Use on rims that MOUNT in response to state (e.g. the
   * selected nav item) so the first unmasked frame never flashes. Default 0.
   */
  fadeInMs?: number;
  /**
   * RGB channels of the rim highlight as `"r, g, b"` (0–255). Default white.
   * Use a warm/cool triple to tint the glass edge, e.g. `"180, 210, 255"`.
   */
  accentColor?: string;
  /**
   * Base alpha (0–1) of the OUTER ring; inner rings fade toward 0. Default 0.3.
   * Raise for a brighter, more pronounced rim; lower for a subtle hairline.
   */
  intensity?: number;
  /** Number of concentric rings. More = smoother radial fade. Default 2. */
  steps?: number;
  /** Thickness (px) of each ring. Total rim = steps * band. Default 0.4. */
  band?: number;
}

const DEFAULTS = {
  borderWidth: 0,
  shadowScale: 1,
  enabled: true,
  fadeInMs: 0,
  accentColor: "255, 255, 255",
  intensity: 0.3,
  steps: 2,
  band: 0.4,
} satisfies Required<RimOptions>;

const MASK_VALUE =
  "linear-gradient(white, white) content-box, linear-gradient(white, white)";

// Accent for a ring, brightest at the outer edge (step 0), fading inward.
function accentAt(step: number, steps: number, rgb: string, intensity: number): string {
  const alpha = intensity * (1 - step / steps);
  return `rgba(${rgb},${alpha})`;
}

// ── Surface colour resolution ────────────────────────────────────────────────

// A CSS colour reads as transparent when it is the keyword, empty, or any
// rgb/rgba with a zero alpha (e.g. "rgba(0, 0, 0, 0)").
function isTransparent(color: string): boolean {
  const c = color.replace(/\s/g, "");
  return c === "" || c === "transparent" || /,0\)$/.test(c);
}

// The colour the rim's SHADOW zones must be BAKED to so they melt into the card —
// needed ONLY when the host's OWN background is transparent (the real background
// lives on an inner wrapper): there the page, not the card, sits behind the rim
// strip, so we bake that child's colour.
//
// When the host paints its own opaque background we deliberately DON'T bake it
// (returns null → renderRings uses the transparent RIM_SHADOW). The rim strip
// already overlays that background, so a transparent shadow reveals it
// pixel-for-pixel — identical at rest, and it tracks the surface for free when the
// bg animates between states, so a state change can't flash a stale baked colour.
// Rim ring layers (marked data-rim) are skipped. Null when nothing to bake.
function bakedSurfaceColor(el: HTMLElement): string | null {
  if (!isTransparent(getComputedStyle(el).backgroundColor)) return null;
  for (const child of Array.from(el.children)) {
    if (!(child instanceof HTMLElement) || child.dataset.rim) continue;
    const bg = getComputedStyle(child).backgroundColor;
    if (!isTransparent(bg)) return bg;
  }
  return null;
}

// ── Layers ───────────────────────────────────────────────────────────────────

function makeRingLayer(): HTMLSpanElement {
  const layer = document.createElement("span");
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.rim = "1";
  layer.style.position = "absolute";
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "1";
  // Mask clips each gradient to its `band` px ring. Set inline to guarantee
  // application regardless of stylesheet load order.
  layer.style.setProperty("mask", MASK_VALUE);
  layer.style.setProperty("mask-composite", "exclude");
  layer.style.setProperty("-webkit-mask", MASK_VALUE);
  layer.style.setProperty("-webkit-mask-composite", "xor");
  return layer;
}

interface RenderConfig {
  borderWidth: number;
  shadowScale: number;
  accentColor: string;
  intensity: number;
  steps: number;
  band: number;
}

// When borderWidth > 0 the rings are offset outward by that amount so they sit on
// the border pixels, and the shadow zones stay transparent so the border shows
// through (border blend). When 0 the shadow zones are also transparent so the
// host's own background shows through and melts the corners — tracking it for free
// across state changes; only a host whose own bg is transparent bakes its
// inner-wrapper colour (see bakedSurfaceColor).
function renderRings(
  el: HTMLElement,
  layers: HTMLSpanElement[],
  cfg: RenderConfig,
): void {
  const { offsetWidth: w, offsetHeight: h } = el;
  if (w === 0 || h === 0) return;

  const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  const shadow =
    cfg.borderWidth > 0 ? RIM_SHADOW : (bakedSurfaceColor(el) ?? RIM_SHADOW);

  layers.forEach((layer, step) => {
    const offset = -cfg.borderWidth + step * cfg.band; // step inward from outer edge
    layer.style.inset = `${offset}px`;
    layer.style.padding = `${cfg.band}px`;
    layer.style.borderRadius = `${Math.max(0, r - step * cfg.band)}px`;
    layer.style.background = buildGradient(
      w,
      h,
      r,
      shadow,
      accentAt(step, cfg.steps, cfg.accentColor, cfg.intensity),
      cfg.shadowScale,
    );
  });
}

// Re-resolves the rim whenever a borderless host's background changes by state
// (hover/active/focus pseudo-classes, or JS-driven class/style changes), so the
// shadow zones keep matching the surface. Returns a cleanup.
function observeSurface(el: HTMLElement, render: () => void): () => void {
  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName === "background-color") render();
  };
  const events = [
    "pointerenter",
    "pointerleave",
    "pointerdown",
    "pointerup",
    "focusin",
    "focusout",
  ] as const;
  events.forEach((t) => el.addEventListener(t, render));
  el.addEventListener("transitionend", onTransitionEnd);
  const mo = new MutationObserver(render);
  mo.observe(el, {
    attributes: true,
    attributeFilter: ["class", "style"],
    subtree: true,
  });

  return () => {
    events.forEach((t) => el.removeEventListener(t, render));
    el.removeEventListener("transitionend", onTransitionEnd);
    mo.disconnect();
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Draws a masked "glass edge" rim on the element behind `ref`. The rim is a set
 * of absolutely-positioned, pointer-events-none `<span>` layers appended as the
 * host's children, so the host MUST be positioned (`position: relative` or
 * similar) and MUST NOT clip overflow (the rim uses `inset: -1px`).
 *
 * @param ref     A ref to the host element. The hook is a no-op until it resolves.
 * @param options See {@link RimOptions}. Backwards-compatible with positional
 *                args via {@link useRimEffectArgs} if you prefer.
 */
export function useRimEffect(
  ref: RefObject<HTMLElement | null>,
  options: RimOptions = {},
): void {
  const {
    borderWidth,
    shadowScale,
    enabled,
    fadeInMs,
    accentColor,
    intensity,
    steps,
    band,
  } = { ...DEFAULTS, ...options };

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const cfg: RenderConfig = {
      borderWidth,
      shadowScale,
      accentColor,
      intensity,
      steps,
      band,
    };

    const layers = Array.from({ length: steps }, () => {
      const layer = makeRingLayer();
      if (fadeInMs > 0) {
        layer.style.opacity = "0";
        layer.style.transition = `opacity ${fadeInMs}ms ease-out`;
      }
      el.appendChild(layer);
      return layer;
    });

    const render = () => renderRings(el, layers, cfg);
    render();

    // Reveal only after the masked rings have painted once, so the fade never
    // exposes the raw (unmasked) gradient. Double rAF = next paint guaranteed.
    let raf1 = 0;
    let raf2 = 0;
    if (fadeInMs > 0) {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          layers.forEach((layer) => (layer.style.opacity = "1"));
        });
      });
    }

    const ro = new ResizeObserver(render);
    ro.observe(el);

    // Only borderless hosts derive their shadow from the (state-dependent) bg.
    const unobserve = borderWidth > 0 ? null : observeSurface(el, render);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro.disconnect();
      unobserve?.();
      // A faded rim (fadeInMs > 0) is one that MOUNTS on state — so it must also
      // fade OUT on deselect, not pop. Fade opacity to 0 (the layer's existing
      // opacity transition drives it) and detach once that has run, so the glass
      // edge never blinks off while the host's own bg is still fading out.
      if (fadeInMs > 0) {
        layers.forEach((layer) => (layer.style.opacity = "0"));
        window.setTimeout(() => layers.forEach((l) => l.remove()), fadeInMs);
      } else {
        layers.forEach((layer) => layer.remove());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ref,
    borderWidth,
    shadowScale,
    enabled,
    fadeInMs,
    accentColor,
    intensity,
    steps,
    band,
  ]);
}
