# PR #70 review fixes

## Behavior

- Theme paints now use Tailwind utilities, including SVG outlines, axes,
  missing-cell patterns and loading marks. This supports Tailwind 3 themes
  whose variables contain HSL channels and Tailwind 4 themes whose variables
  contain complete CSS colors. Custom data colors remain CSS paints, including
  `currentColor`. The Heatmap's missing-value tooltip color inherits a local
  CSS variable compiled from the theme's `muted` color.
- Sankey inspection stays inside the chart frame even when the selected
  connection's midpoint falls outside the scroll viewport. It remains visible
  while scrolling, and Escape dismisses it.
- LineChart synchronizes inspection with the SVG element that still holds
  keyboard focus after data changes. It retains the selected series when that
  observation exists and falls back to an available series when it becomes
  missing. Pointer-only inspection still clears when observations change.

## Reproduction and coverage

- `LineChart / LiveKeyboardInspection` in Storybook updates observations every
  two seconds. Focus a category, use Up/Down to select a series, and verify that
  its focus indicator and inspection survive the update.
- `SankeyChart / NarrowDirectPath` exposes a direct first-to-last connection in
  a narrow viewport. Hover its visible beginning or select it with End, then
  scroll horizontally. Its tooltip stays within the frame.
- Component tests cover retained focus, updated tooltip values, callback data,
  fallback after a selected series becomes missing, blur cleanup, Sankey
  scrolling, keyboard inspection and Escape.
- Browser validation used the actual components bundled with React and Framer
  Motion, CSS compiled by Tailwind 3.4.17 and the installed Tailwind 4 compiler,
  and Chromium. Both light and dark themes were checked for computed SVG
  paints, custom `currentColor`, data refresh and narrow Sankey inspection.

## Validation

- Jest: 71 suites, 956 tests passed.
- TypeScript, production build and Storybook build passed.
- Registry artifacts regenerated through `npm run build:registry`.
- Global lint retains the existing 26 errors and 22 warnings.
