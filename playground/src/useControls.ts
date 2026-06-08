import { useState } from "react";

// Tiny state bag for the playground controls. Keeps App.tsx declarative.
export function useControls() {
  const [color, setColor] = useState("#ffffff");
  const [intensity, setIntensity] = useState(0.3);
  const [steps, setSteps] = useState(2);
  const [band, setBand] = useState(0.4);
  const [shadowScale, setShadowScale] = useState(1);

  return {
    color,
    intensity,
    steps,
    band,
    shadowScale,
    set: {
      color: setColor,
      intensity: setIntensity,
      steps: setSteps,
      band: setBand,
      shadowScale: setShadowScale,
    },
  };
}
