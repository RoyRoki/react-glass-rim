---
title: "Add an Apple-style liquid-glass rim to any React element (zero dependencies)"
published: false
description: "A tiny React hook + component for the glassmorphism rim / edge-light effect that plain CSS can't do — follows rounded corners, fades around the contour, adapts to cards, pills and circles."
tags: react, css, webdev, typescript
cover_image: https://royroki.github.io/react-glass-rim/og.png
canonical_url: https://github.com/royroki/react-glass-rim
---

If you've tried to build a **glassmorphism** card — the frosted, Apple-"liquid-glass" look — you've probably hit this wall: the blur and the translucent fill are easy, but the **bright rim that runs along the edge** is not. A plain `border` is a flat, uniform line. A `box-shadow` rim is uniform too. `border-image` with a gradient breaks the moment you add `border-radius`.

The thing that actually sells the glass look is that the highlight **isn't uniform** — it's bright where light catches the corner and fades to nothing on the shadowed side. That's what I packaged up.

## react-glass-rim

[**Live playground**](https://royroki.github.io/react-glass-rim/) · [GitHub](https://github.com/royroki/react-glass-rim) · [npm](https://www.npmjs.com/package/react-glass-rim)

- ~1.5 kB gzipped, **zero runtime dependencies**
- A `useRimEffect` hook **and** a `<Rim>` drop-in component
- Follows rounded corners, fades the highlight around the contour
- Auto-adapts to **cards, pills, and circles**
- SSR / Next.js App Router safe

```bash
npm install react-glass-rim
```

## The whole glass surface in ~10 lines

```tsx
import { Rim } from "react-glass-rim";

export function GlassCard() {
  return (
    <Rim
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        borderRadius: 24,
      }}
      intensity={0.35}
    >
      <h3>Liquid glass</h3>
      <p>Translucent fill + blur + a real edge light.</p>
    </Rim>
  );
}
```

Already render your own element? Use the hook instead — no wrapper node:

```tsx
import { useRef } from "react";
import { useRimEffect } from "react-glass-rim";

function Card() {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, { intensity: 0.35, accentColor: "180, 210, 255" }); // cool-tinted glass
  return <div ref={ref} className="card">…</div>;
}
```

## Why not just CSS?

| Approach | Follows radius | Fades around the edge | Adapts shape |
| --- | :---: | :---: | :---: |
| `border: 1px solid` | ✅ | ❌ | ❌ |
| `box-shadow` rim | ⚠️ | ❌ | ❌ |
| gradient `border-image` | ❌ | ⚠️ | ❌ |
| **react-glass-rim** | ✅ | ✅ | ✅ |

## How it works

The rim is a couple of absolutely-positioned, `pointer-events: none` layers appended to your host. Each draws a `conic-gradient` (bright on the lit corners → transparent on the shadowed ones) that's **masked down to a hairline strip** on the border with `mask-composite`. It re-derives the gradient on resize, and on borderless hosts it even tracks the background through hover/active state changes so the shadowed zones always melt into the surface.

Two rules for the host: it must be **positioned** (`position: relative`) and must **not** clip overflow (`overflow: hidden` would cut the rim — clip an inner wrapper instead).

## Try it

The [playground](https://royroki.github.io/react-glass-rim/) has live sliders for accent color, intensity, ring count, blur, and a colored-border mode. If it's useful, a ⭐ on [GitHub](https://github.com/royroki/react-glass-rim) helps a lot.
