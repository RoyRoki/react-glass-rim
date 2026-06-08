# Changelog

All notable changes to **react-glass-rim** are documented here. This project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and the
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## [Unreleased]

## [0.1.0] — 2026-06-08

### Added

- `useRimEffect(ref, options)` — attaches a masked conic-gradient glass-edge rim
  to a host element via pointer-events-none ring layers.
- `<Rim>` component — drop-in wrapper that owns its own ref and applies the
  structural styles the rim requires.
- `buildGradient()` — pure, DOM-free conic-gradient math (flat / circular /
  uniform modes selected from geometry), exported for custom renderers.
- Configurable rim: `accentColor`, `intensity`, `steps`, `band`, plus
  `borderWidth`, `shadowScale`, `enabled`, and `fadeInMs`.
- Dual ESM + CJS build with `.d.ts` types; zero runtime dependencies;
  `react >= 18` peer dependency.
- Vite playground with live controls.

[Unreleased]: https://github.com/royroki/react-glass-rim/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/royroki/react-glass-rim/releases/tag/v0.1.0
