import { useRef } from "react";
import { useRimEffect, Rim, type RimOptions } from "react-glass-rim";
import { useControls } from "./useControls";

// hex (#rrggbb from <input type=color>) → "r, g, b" for accentColor.
function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function App() {
  const c = useControls();
  const opts: RimOptions = {
    accentColor: hexToRgb(c.color),
    intensity: c.intensity,
    steps: c.steps,
    band: c.band,
    shadowScale: c.shadowScale,
  };

  return (
    <div className="shell">
      <Panel c={c} opts={opts} />
      <main className="stage">
        <div className="demo-label">Cards (flat directional rim)</div>
        <HookCard opts={opts} title="useRimEffect" body="Attached to a host you render. No wrapper element." />
        <Rim className="card" {...opts}>
          <h3>&lt;Rim&gt;</h3>
          <p>Drop-in wrapper. Owns its own ref + structural styles.</p>
        </Rim>

        <div className="demo-label">Pills &amp; round shapes</div>
        <HookPill opts={opts} />
        <HookCircle opts={opts} />
      </main>
    </div>
  );
}

// ── Demo hosts using the hook directly ────────────────────────
function HookCard({ opts, title, body }: { opts: RimOptions; title: string; body: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, opts);
  return (
    <div ref={ref} className="card">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function HookPill({ opts }: { opts: RimOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, { ...opts, shadowScale: Math.max(opts.shadowScale ?? 1, 1.6) });
  return (
    <div ref={ref} className="pill">
      Glass pill
    </div>
  );
}

function HookCircle({ opts }: { opts: RimOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, opts);
  return (
    <div ref={ref} className="circle">
      Round
    </div>
  );
}

// ── Controls panel ────────────────────────────────────────────
function Panel({ c, opts }: { c: ReturnType<typeof useControls>; opts: RimOptions }) {
  const snippet = `<Rim
  accentColor="${opts.accentColor}"
  intensity={${opts.intensity}}
  steps={${opts.steps}}
  band={${opts.band}}
>
  …
</Rim>`;

  return (
    <aside className="panel">
      <h1>react-glass-rim</h1>
      <p className="sub">
        A masked conic-gradient glass edge for any element. Tweak the rim and watch
        every demo update live.
      </p>

      <div className="field">
        <label htmlFor="color">
          Accent color <span className="val">{c.color}</span>
        </label>
        <input id="color" type="color" value={c.color} onChange={(e) => c.set.color(e.target.value)} />
      </div>

      <Slider label="Intensity" value={c.intensity} min={0} max={1} step={0.01} onChange={c.set.intensity} />
      <Slider label="Steps (rings)" value={c.steps} min={1} max={6} step={1} onChange={c.set.steps} />
      <Slider label="Band (px/ring)" value={c.band} min={0.2} max={2} step={0.1} onChange={c.set.band} />
      <Slider label="Shadow scale" value={c.shadowScale} min={1} max={3} step={0.1} onChange={c.set.shadowScale} />

      <div className="snippet">
        <pre>{snippet}</pre>
      </div>
    </aside>
  );
}

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label>
        {props.label} <span className="val">{props.value}</span>
      </label>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}
