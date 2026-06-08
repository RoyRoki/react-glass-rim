import { describe, it, expect } from "vitest";
import { buildGradient, RIM_ACCENT, RIM_SHADOW } from "./rimGradient";

// buildGradient is pure (no DOM), so it's fully unit-testable. We assert the
// MODE it selects from geometry and that the supplied colours land in the output
// — not exact degree maths, which is an implementation detail of the look.

describe("buildGradient", () => {
  it("returns a uniform linear-gradient for elements thinner than the min dim", () => {
    // 8px short side < RIM_MIN_DIM (12px) → no directional fade possible.
    const out = buildGradient(200, 8, 4, RIM_SHADOW, "rgba(255,255,255,0.3)");
    expect(out).toContain("linear-gradient");
    expect(out).not.toContain("conic-gradient");
    expect(out).toContain("rgba(255,255,255,0.3)");
  });

  it("uses flat (directional) mode for a low-radius card", () => {
    // roundness = 24 / (150/2) = 0.32 < 0.75 → flat, even though it's wide.
    const out = buildGradient(300, 150, 24, RIM_SHADOW);
    expect(out).toContain("conic-gradient");
    // Flat mode emits the mirrored 10-stop ramp.
    expect(out).toContain(RIM_SHADOW);
  });

  it("uses circular mode for a genuine circle", () => {
    // 120×120, r=60 → roundness 1, cornerDeg 45 ∈ [35,55] → circular.
    const out = buildGradient(120, 120, 60, RIM_SHADOW);
    expect(out).toContain("conic-gradient");
  });

  it("defaults the accent to RIM_ACCENT when omitted", () => {
    const out = buildGradient(300, 150, 24, RIM_SHADOW);
    expect(out).toContain(RIM_ACCENT);
  });

  it("threads custom accent + shadow colours into the output", () => {
    const accent = "rgba(180,210,255,0.5)";
    const shadow = "rgba(0,0,0,0)";
    const out = buildGradient(300, 150, 24, shadow, accent);
    expect(out).toContain(accent);
    expect(out).toContain(shadow);
  });

  it("never throws on degenerate sizes", () => {
    expect(() => buildGradient(0, 0, 0, RIM_SHADOW)).not.toThrow();
    expect(() => buildGradient(1, 1000, 0, RIM_SHADOW)).not.toThrow();
  });

  it("produces a valid CSS gradient function call", () => {
    const out = buildGradient(300, 150, 24, RIM_SHADOW);
    // Balanced parentheses — a cheap guard against malformed stop assembly.
    const open = (out.match(/\(/g) ?? []).length;
    const close = (out.match(/\)/g) ?? []).length;
    expect(open).toBe(close);
  });
});
