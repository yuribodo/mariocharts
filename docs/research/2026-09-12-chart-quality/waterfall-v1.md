# WaterfallChart v1

Implemented September 14, 2026, after the approved TreeMap was committed as `73c7d00`.
This completes the component passes for the twelve-chart registry.

## Direction and references

Preserve the chart library's restrained appearance while making each step's meaning explicit. The core use cases are cash movement, a recurring-revenue bridge, profit and loss, and changes within reporting periods.

[Highcharts' waterfall documentation](https://www.highcharts.com/docs/chart-and-series-types/waterfall-series) distinguishes computed full sums from intermediate summaries. Its linked diagram was inspected visually: floating contributions, horizontal connectors, and separate summary colors provide the useful structure. [Plotly's waterfall examples](https://plotly.com/javascript/waterfall-charts/) demonstrate relative changes, absolute balances, calculated totals, horizontal orientation and outside labels. These are references for behavior and hierarchy; neither library was added as a dependency.

The existing research identifies Waterfall's pure cumulative model as a useful internal pattern. We retained that boundary and extended its contract rather than building a generic bar engine. The optional request for additional user references received no response during implementation; this pass uses the existing repository direction and the primary sources above.

## Rendered review

| Before | After | Why |
| --- | --- | --- |
| Only changes and manually supplied absolute totals | Changes, absolute totals, computed running sums and period subtotals | Users can express checkpoints without recalculating totals or counting a summary twice |
| Every adjacent pair connected, including balance resets | Absolute discontinuities break the connector and explain the reset in inspection | A line should not imply an unchanged running balance when the input explicitly replaces it |
| Fixed corners and filled bars | Filled/outline variants, configurable radius and bar width | Presentation varies without changing value-space semantics |
| Narrow horizontal labels and every bar compressed into the available space | Orientation-aware label margins and internal scrolling for long sequences | Preserve readable categories and usable targets |
| Separate loading/error roots | One persistent frame with shape-preserving refresh and initial skeleton | Loading-to-data transitions retain measurement and layout |
| Hover glow and one tab stop per bar | Measured tooltip, visible stroke focus, roving keyboard navigation and a data table | Pointer, keyboard and touch can inspect the same observations |
| Browser-dependent SVG transform origins | Native transforms anchored to each bar's actual starting balance | Negative totals and floating decreases grow in the correct direction |
| Client-only theme and reduced-motion values changed initial page attributes | Stable initial markup followed by browser preference application | The docs page hydrates without warnings or stale attributes |

Desktop, narrow/mobile, light/dark, outline, negative, zero, missing, long-label and dense fixtures were rendered and inspected. The default increase green is `#059669`, which improves contrast on light chart surfaces. Text remains outside the colored bars. Custom colors accept CSS variables and named colors; caller-supplied colors still determine their own contrast.

## Data semantics

- Missing step type infers increase/decrease from the numeric sign. Explicit direction normalizes magnitude, preserving the prior API.
- `total` uses its provided signed absolute balance, draws from zero and resets both the running balance and checkpoint.
- `sum` omits its value, draws the current balance from zero and starts a new checkpoint without adding anything.
- `subtotal` omits its value, draws the movement from the previous total/sum/subtotal checkpoint to the current balance and advances the checkpoint. Use `sum` for gross profit or a closing balance; use `subtotal` for a period's movement.
- `initialValue` supplies an opening balance without creating an observation. The footer and accessible description expose it; an explicit opening total row provides a visible opening bar.
- Computed steps accept absent/null values. Other values on computed steps are rejected instead of ignored. Changes/totals require finite numbers; numeric strings, missing observations, unknown types and blank labels produce actionable errors. Overflowing accumulation is also rejected.
- Rows retain their original identity, labels and input indices. The sequence is never sorted or filtered. Repeated labels remain distinct observations.
- Scaling normalizes by a power of ten before tick calculation and subtraction, avoiding overflow in signed domains and handling very small finite values. Zero always remains in the scale.
- Zero changes use a thin marker, not a fabricated minimum bar height. Tiny changes keep their actual geometry and larger invisible inspection targets.

## Interaction and motion

One bar is in the tab order. Arrow keys move through the input sequence, Home/End jump to its bounds, Enter/Space select the original observation, and Escape dismisses inspection while preserving visible focus. Focus recovers when the selected row disappears. Scrolling brings keyboard-selected steps into view.

Touch uses category slots and value targets of at least 44px; dense horizontal sequences scroll inside the fixed frame. The footer indicates when more steps require scrolling. View data lists the full sequence, step types, values and balances, including zeros and tiny movements. Values throughout the component use `valueFormatter`, so precision follows the supplied formatter. The custom tooltip payload also contains raw numeric values.

A shared motion value drives native SVG growth from `bar.start`. Text stays stationary and opacity stays at 1. Entrance duration is bounded across long sequences. Data/orientation changes can replay the entrance; style, formatter, hover and resize changes do not restart it. Inspection stops the animation controller and finishes the geometry immediately. Disabled/reduced motion renders final geometry.

The chart uses only the existing published dependencies. `utils.ts` remains its distributed sibling; shared inspection, resize, formatting and lifecycle helpers are installed through registry dependencies.

## API and migration

Existing numeric `increase`, `decrease` and `total` rows retain their meaning. New options include `variant`, `borderRadius`, `barWidth`, `initialValue`, `connectorStyle`, `valueFormatter`, `ariaLabel` and `description`. The existing height, orientation, legend, grid, values, connectors, loading, error, callback and tooltip options remain.

Custom tooltip types now include `sum` and `subtotal`, previous balance, geometric start/end, formatted value and formatted cumulative balance. Readonly arrays with mixed step shapes and custom label/value/type keys preserve inference. The root barrel now exports WaterfallChart and its public types.

Invalid values that previously became zero now show an error. Unknown types no longer silently fall back to sign inference in the chart model. Labels and values that cannot fit remain available through inspection or the table. Dense sequences scroll rather than indefinitely shrinking every mark.

The docs playground offers cash flow, profit and loss, MRR, period subtotals, crossing zero, resets, zero/tiny/many/long/missing/single observations, both orientations, both mark variants, palettes, connectors, corners, bar width, state controls and replay. Thirty Storybook stories mirror these scenarios.

## Verification

- Full Jest suite: **71 suites, 953 tests passed**, including a subsequent `npx jest --ci --coverage --runInBand` run. Coverage thresholds passed: statements 84.40%, branches 87.43%, functions 82.06%, lines 84.45%.
- Waterfall-specific checks: **3 suites, 55 tests passed**. This covers checkpoint math, original identities, invalid inputs, extreme scales, lifecycle recovery, zero/tiny geometry, keyboard interaction, focus recovery, styles and motion preferences.
- Two new hydration regression tests cover the shared header and code block. The associated component suites passed (12 tests).
- TypeScript and the production Next/CLI build passed.
- Scoped Waterfall/component-page lint passed without errors or warnings. Existing shared site test mocks retain unused-argument warnings. Global lint remains blocked by **26 existing errors and 22 warnings**; it is not claimed as passing.
- Storybook production build passed.
- CLI smoke test passed: **48 files installed**, expected packages present, no unresolved monorepo imports.
- A clean React 18.3.1 consumer installed Waterfall through the compiled CLI and passed strict TypeScript, exact optional properties and unchecked-index checks. It exercises readonly mixed step shapes, custom keys, inferred original callbacks, inspection and invalid prop rejection.
- Production Chromium QA passed with **zero console/page errors**, both orientations/variants, all playground fixtures/states, keyboard selection and dismissal, data table, internal scrolling, light/dark palettes, bounded mobile tooltip and native touch. Motion sampling observed **42 distinct growth frames with constant opacity**; focus interrupted animation without later resumption.
- `npm run dev:cli` was attempted again. Its existing Node 26/tsx watcher failure persists (`ERR_PACKAGE_PATH_NOT_EXPORTED`, `unicorn-magic`). Compiled CLI installation and consumer compilation passed independently; no dependency or lockfile workaround was introduced.
- `npm run build:registry` regenerated the affected artifacts from the manifest/source. The registry still contains twelve charts and forty generated files.
- The user's unrelated `package-lock.json` modification (26 removed peer flags) was preserved.

Browser validation is Chromium-based, not a screen-reader certification or a cross-browser/device performance guarantee.

## Rendered evidence

[Recorded playground walkthrough](../../demos/chart-refactor-waterfall.gif) covers growth, inspection, subtotals, orientation, outline, palette changes, negative balances and the data table.

- [Cash flow](assets/waterfall-v1/cash-flow.png)
- [Period subtotals](assets/waterfall-v1/periods.png)
- [Horizontal subtotals](assets/waterfall-v1/horizontal-subtotals.png)
- [Outline](assets/waterfall-v1/horizontal-outline.png)
- [Crossing zero](assets/waterfall-v1/negative.png)
- [Absolute reset](assets/waterfall-v1/reset.png)
- [Tiny changes](assets/waterfall-v1/tiny.png)
- [All zero](assets/waterfall-v1/zero.png)
- [Dense sequence](assets/waterfall-v1/many.png)
- [Light theme](assets/waterfall-v1/light-default.png)
- [Initial loading](assets/waterfall-v1/initial-loading.png)
- [Refreshing](assets/waterfall-v1/loading.png)
- [Mobile vertical](assets/waterfall-v1/mobile-vertical.png)
- [Touch horizontal](assets/waterfall-v1/touch-horizontal.png)

Review route: http://localhost:3100/docs/components/waterfall-chart
