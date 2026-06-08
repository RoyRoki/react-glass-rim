// react-glass-rim — a masked conic-gradient "glass edge" rim for any element.
//
// Two ways to use it:
//   • useRimEffect(ref, options)  — attach the rim to a host you already render.
//   • <Rim>…</Rim>                — drop-in wrapper that owns its own host.
//
// Plus buildGradient() if you want the pure gradient math without the DOM glue.

export { useRimEffect, type RimOptions } from "./useRimEffect";
export { Rim, type RimProps } from "./Rim";
export { buildGradient, RIM_ACCENT, RIM_SHADOW } from "./rimGradient";
