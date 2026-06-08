# react-glass-rim

> A masked conic-gradient **glass-edge rim** for any React element — a hook **and** a drop-in component, with **zero runtime dependencies**.

`react-glass-rim` draws a soft, directional "liquid glass" highlight around the border of an element. Unlike a plain `border` or `box-shadow`, the rim follows rounded corners, fades the highlight around the contour (bright on the lit corners, transparent on the shadowed ones), and adapts to **cards, pills, and circles** automatically.

It works by appending a couple of absolutely-positioned, `pointer-events: none` ring layers to your host and masking a conic-gradient down to a hairline strip on the border — no canvas, no SVG, no extra paint cost on your content.

---

## Install

```bash
npm install react-glass-rim
# or
pnpm add react-glass-rim
# or
yarn add react-glass-rim
```

React 18+ is a peer dependency.

---

## Quick start

### Option A — the `<Rim>` component (easiest)

```tsx
import { Rim } from "react-glass-rim";

export function Card() {
  return (
    <Rim className="card" intensity={0.35}>
      <h3>Glass card</h3>
      <p>The rim wraps these children.</p>
    </Rim>
  );
}
```

`<Rim>` renders a `<div>` by default (change it with `as`), owns its own ref, and applies the structural styles the rim needs (`position: relative`, `isolation: isolate`). Your `className` / `style` still win.

### Option B — the `useRimEffect` hook (no wrapper element)

Use this when you already render the host element yourself:

```tsx
import { useRef } from "react";
import { useRimEffect } from "react-glass-rim";

export function Card() {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, { intensity: 0.35 });

  return (
    <div ref={ref} className="card">
      …
    </div>
  );
}
```

---

## The host must satisfy two rules

The rim attaches **real DOM children** to your host and positions them with `inset: -1px`, so:

1. **The host must establish a positioning context** — `position: relative` (or `absolute`/`fixed`). `<Rim>` does this for you; with the hook you set it yourself.
2. **The host must NOT clip overflow.** `overflow: hidden` will cut the rim off. If you need to clip your *content* (e.g. an image with rounded corners), put the rim on an outer element and clip an **inner** wrapper:

```tsx
<div ref={rimHostRef} className="card">      {/* rim host — no overflow clip */}
  <div className="card-inner">              {/* clips children */}
    <img … />
  </div>
</div>
```

---

## API

### `useRimEffect(ref, options?)`

| param     | type                          | description                                  |
| --------- | ----------------------------- | -------------------------------------------- |
| `ref`     | `RefObject<HTMLElement \| null>` | Ref to the host element. No-op until it resolves. |
| `options` | `RimOptions`                  | See below.                                   |

### `<Rim {...RimOptions} as? className? style? … />`

A wrapper component. Accepts every `RimOptions` field as a prop, plus `as` (the element/tag to render, default `"div"`) and any normal DOM props which spread onto the host.

### `RimOptions`

| option        | type      | default          | description |
| ------------- | --------- | ---------------- | ----------- |
| `accentColor` | `string`  | `"255, 255, 255"`| RGB channels of the highlight as `"r, g, b"`. Tint it warm/cool. |
| `intensity`   | `number`  | `0.3`            | Alpha (0–1) of the **outer** ring; inner rings fade toward 0. Higher = brighter rim. |
| `steps`       | `number`  | `2`              | Number of concentric rings. More = smoother radial fade. |
| `band`        | `number`  | `0.4`            | Thickness (px) of each ring. Total rim ≈ `steps × band`. |
| `borderWidth` | `number`  | `0`              | Your host's CSS border thickness, so the rim overlays the border exactly. Pass `0` for borderless hosts. |
| `shadowScale` | `number`  | `1`              | `> 1` grows the corner shadow on **short** elements (small pills) so the fade never reads as a hard line. |
| `enabled`     | `boolean` | `true`           | Gate the rim on/off (e.g. only the active nav item). Flipping it mounts/unmounts the rim. |
| `fadeInMs`    | `number`  | `0`              | When `> 0`, the rim fades in (and out) over this duration. Use for rims that mount **on state change** so the first frame never flashes. |

### `buildGradient(w, h, r, shadow, accent?, shadowScale?)`

The pure conic-gradient math, exported for advanced/custom renderers. No React, no DOM.

---

## How it adapts to shape

`buildGradient` inspects the host's aspect ratio and corner radius each render (it re-runs on resize):

- **Cards & panels** → a *flat* directional rim: bright top-left / bottom-right, transparent at the other two corners.
- **Genuine circles / squares with a large radius** → a *circular* glass highlight placed by angle.
- **Very thin elements** (< 12px short side) → a uniform rim, since a directional fade can't render cleanly that small.

You don't choose the mode — it's derived from the geometry.

---

## Playground

A live, interactive playground (Vite) ships in this repo:

```bash
pnpm install
pnpm playground   # from the repo root
```

Drag the sliders for color, intensity, steps, band, and shadow scale and watch every demo update in real time. It also prints the matching `<Rim … />` snippet.

---

## SSR / Next.js

The hook and component are marked `"use client"`. The rim is drawn in a `useEffect`, so it's a no-op during SSR and hydrates on the client — safe to render inside Server Components as a client island.

---

## License

MIT © [Roki Roy](https://rokiroy.in)
