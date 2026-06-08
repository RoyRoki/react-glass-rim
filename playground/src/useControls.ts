import { useState } from "react";

// Selectable backdrops so the glass blur has real imagery to refract.
export const BACKGROUNDS = {
  Aurora:
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1600&q=80",
  Mesh: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=1600&q=80",
  Bloom:
    "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1600&q=80",
} as const;

export type BgName = keyof typeof BACKGROUNDS;

// Tiny state bag for the playground controls. Keeps App.tsx declarative.
export function useControls() {
  const [color, setColor] = useState("#ffffff");
  const [intensity, setIntensity] = useState(0.3);
  const [steps, setSteps] = useState(2);
  const [band, setBand] = useState(0.4);
  const [shadowScale, setShadowScale] = useState(1);

  // Glass + background.
  const [bg, setBg] = useState<BgName>("Aurora");
  const [blur, setBlur] = useState(16); // px of backdrop blur on the cards

  // Colored border (the rim overlays it via borderWidth, like WidgetCard).
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState("#b69bff");
  const [borderWidth, setBorderWidth] = useState(1.5);

  return {
    color,
    intensity,
    steps,
    band,
    shadowScale,
    bg,
    blur,
    borderEnabled,
    borderColor,
    borderWidth,
    set: {
      color: setColor,
      intensity: setIntensity,
      steps: setSteps,
      band: setBand,
      shadowScale: setShadowScale,
      bg: setBg,
      blur: setBlur,
      borderEnabled: setBorderEnabled,
      borderColor: setBorderColor,
      borderWidth: setBorderWidth,
    },
  };
}
