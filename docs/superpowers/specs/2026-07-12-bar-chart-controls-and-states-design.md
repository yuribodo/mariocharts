# Bar Chart Controls and States Design

## Scope

Refine only the Bar Chart playground controls and production-state presentation. Keep the chart API, examples, code block, theme behavior, logo, and surrounding documentation unchanged.

## Playground Controls

Use a property-panel layout inspired by developer tools and Storybook:

- Desktop uses a narrow settings column beside the chart canvas.
- Mobile stacks settings above the chart.
- Orientation and appearance use labeled binary segmented controls.
- Orientation options use vertical and horizontal chart icons.
- Appearance options use filled and outline bar icons.
- The active option uses a neutral elevated surface rather than a chart color.
- A shared active indicator slides horizontally between options in `180ms` using an interruptible CSS transform transition.
- Icon and label states transition only color and opacity; buttons do not resize or shift.
- Each option exposes `aria-pressed`, supports visible focus, and has a minimum 40px hit area.
- Arrow keys move between options within each segmented control.
- Each control includes a concise supporting description.
- Animation and replay remain available in the settings panel.
- The chart canvas keeps its existing stable height and multicolor palette.

## Resilient States

Replace the three full chart previews with a compact documentation block titled `Resilient by default`.

- Loading documents stable geometry while data resolves.
- Error documents an actionable inline message without collapsing the frame.
- Empty documents the zero-data fallback.
- Each row names the public prop used to activate the state.
- State indicators remain neutral except for semantic chart-token accents.

## Accessibility

- Native controls retain explicit accessible labels.
- All interactive targets are at least 40px high.
- Replay has an accessible name and disabled state.
- State descriptions remain readable without relying on color.
- Segmented controls expose button semantics, pressed state, and arrow-key navigation.
- Reduced-motion users receive an immediate indicator state change.

## Testing

- Update the Bar Chart documentation test for the new heading and property-panel labels.
- Preserve the interaction test for orientation and appearance changes.
- Exercise button clicks, pressed state, and arrow-key selection.
- Assert the loading, error, and empty state documentation is present.
- Run focused Jest, TypeScript, scoped ESLint, and the complete Jest suite.
