import { useRef, type CSSProperties } from "react";
import { useRimEffect, Rim, type RimOptions } from "react-glass-rim";
import { useControls, BACKGROUNDS, type BgName } from "./useControls";

// hex (#rrggbb from <input type=color>) → "r, g, b" for accentColor.
function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

type Controls = ReturnType<typeof useControls>;

export function App() {
  const c = useControls();

  // Rim options derived from the controls. When the colored border is on we feed
  // its width to the rim so the rim sits ON the border pixels (border blend),
  // exactly like the WidgetCard in the source app.
  const opts: RimOptions = {
    accentColor: hexToRgb(c.color),
    intensity: c.intensity,
    steps: c.steps,
    band: c.band,
    shadowScale: c.shadowScale,
    borderWidth: c.borderEnabled ? c.borderWidth : 0,
  };

  // Glass surface styles shared by every demo host.
  const glass: CSSProperties = {
    backdropFilter: `blur(${c.blur}px)`,
    WebkitBackdropFilter: `blur(${c.blur}px)`,
    border: c.borderEnabled
      ? `${c.borderWidth}px solid ${c.borderColor}`
      : undefined,
  };

  return (
    <div className="shell">
      <Panel c={c} opts={opts} />
      <main
        className="stage"
        style={{ "--bg": `url("${BACKGROUNDS[c.bg]}")` } as CSSProperties}
      >
        <div className="demo-label">Glass cards (widget blur + rim)</div>
        <HookCard
          opts={opts}
          glass={glass}
          title="useRimEffect"
          body="Translucent fill + backdrop-blur, rim on a host you render."
        />
        <Rim className="card glass" style={glass} {...opts}>
          <div className="card-inner">
            <h3>&lt;Rim&gt;</h3>
            <p>Drop-in wrapper. Owns its ref + structural styles.</p>
          </div>
        </Rim>

        <div className="demo-label">Pills &amp; round shapes</div>
        <HookPill opts={opts} glass={glass} />
        <HookCircle opts={opts} glass={glass} />
      </main>
    </div>
  );
}

// ── Demo hosts using the hook directly ────────────────────────
function HookCard({
  opts,
  glass,
  title,
  body,
}: {
  opts: RimOptions;
  glass: CSSProperties;
  title: string;
  body: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, opts);
  return (
    <div ref={ref} className="card glass" style={glass}>
      <div className="card-inner">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

function HookPill({ opts, glass }: { opts: RimOptions; glass: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, { ...opts, shadowScale: Math.max(opts.shadowScale ?? 1, 1.6) });
  return (
    <div ref={ref} className="pill glass" style={glass}>
      Glass pill
    </div>
  );
}

function HookCircle({ opts, glass }: { opts: RimOptions; glass: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useRimEffect(ref, opts);
  return (
    <div ref={ref} className="circle glass" style={glass}>
      Round
    </div>
  );
}

// ── Controls panel ────────────────────────────────────────────
function Panel({ c, opts }: { c: Controls; opts: RimOptions }) {
  const snippet = `<Rim
  accentColor="${opts.accentColor}"
  intensity={${opts.intensity}}
  steps={${opts.steps}}
  band={${opts.band}}${c.borderEnabled ? `\n  borderWidth={${c.borderWidth}}` : ""}
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
        <label>Background</label>
        <div className="seg">
          {(Object.keys(BACKGROUNDS) as BgName[]).map((name) => (
            <button
              key={name}
              data-active={c.bg === name}
              onClick={() => c.set.bg(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <Slider label="Glass blur (px)" value={c.blur} min={0} max={32} step={1} onChange={c.set.blur} />

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

      <div className="field">
        <label htmlFor="border">
          Colored border
          <button
            id="border"
            className="toggle"
            data-on={c.borderEnabled}
            onClick={() => c.set.borderEnabled(!c.borderEnabled)}
          >
            {c.borderEnabled ? "On" : "Off"}
          </button>
        </label>
      </div>

      {c.borderEnabled && (
        <>
          <div className="field">
            <label htmlFor="bcolor">
              Border color <span className="val">{c.borderColor}</span>
            </label>
            <input
              id="bcolor"
              type="color"
              value={c.borderColor}
              onChange={(e) => c.set.borderColor(e.target.value)}
            />
          </div>
          <Slider label="Border width (px)" value={c.borderWidth} min={0.5} max={4} step={0.5} onChange={c.set.borderWidth} />
        </>
      )}

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
