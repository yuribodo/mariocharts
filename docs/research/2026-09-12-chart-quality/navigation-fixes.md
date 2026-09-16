# Navigation animation and layout stability

## Findings and changes

| Before                                                                                                                   | After                                                                                            | Why                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Switching from a chart scrolled to 1,400px to Docs sent the active underline below the viewport (measured at y=1,238px). | A persistent underline uses a 200ms CSS transform in the navigation's own coordinates.           | Document scroll restoration cannot enter the animation's coordinates. Resize, keyboard navigation, and reduced motion place it directly. |
| Docs lost its active state on Installation and AI Agents.                                                                | Docs stays active throughout its section; Charts owns `/docs/components` and its descendants.    | The current section remains identifiable when navigating through the sidebar.                                                            |
| Highlighting expanded the Line Chart code example from 480px to 860px.                                                   | Inline-block line spans preserve Shiki's existing newline spacing and keep the example at 480px. | Block spans were adding line boxes on top of the newline separators. Full-width line highlighting remains available.                     |
| The right index showed the old page for another 100ms.                                                                   | The index and heading IDs update in a layout effect before paint.                                | Page content and its index appear together; observer registration sees assigned IDs. Active links keep a constant font weight.           |
| Enabling Lenis after hydration changed the parent of the entire page; motion-preference changes repeated the remount.    | Only the Lenis controller mounts/unmounts; page content keeps its position in the React tree.    | Page state, focus, chart measurements, and entrance animations survive scroll-controller changes.                                        |

## Automated browser checks

`scripts/check-navigation.cjs` runs against a local site with Chromium. It checks:

- Cold server-rendered code height versus the height after JavaScript and Shiki load.
- All 12 chart routes through the sidebar, sampling content dimensions, sidebar position/scroll, and table-of-contents text frame by frame.
- Unexpected layout shifts after navigation's first paint (the intended replacement of one page by another is excluded).
- The underline remaining inside the sticky header during navigation from a scrolled document.
- Docs subroutes, keyboard activation, rapid tab switches, browser back/forward, desktop/tablet resizing, reduced motion, and mobile drawer navigation.
- Browser runtime errors and horizontal overflow on mobile.

Run Playwright from an isolated directory so this manual QA tool does not change workspace dependencies:

```bash
npm install --prefix /tmp/mariocharts-browser --no-package-lock playwright-core
npm run build
npm run start -- --port 3100
```

In another terminal, point `CHROMIUM_PATH` at an installed Chromium executable:

```bash
NODE_PATH=/tmp/mariocharts-browser/node_modules \
CHROMIUM_PATH=/path/to/chrome \
SITE_URL=http://localhost:3100 \
node scripts/check-navigation.cjs
```

Screenshots go to `/tmp/mariocharts-navigation` (override with `ARTIFACT_DIR`).

## Validation

- Jest: 73 suites, 962 tests passed, including route-state, synchronous index replacement, and scroll-controller state-preservation regressions.
- TypeScript and ESLint on the changed files passed.
- Production build passed. Chromium checks passed against the production server: all 12 chart routes, scroll restoration, code spacing, navbar interactions, responsive layouts, and mobile navigation. No post-navigation CLS was observed in the sampled transitions.
- Global lint still reports 26 pre-existing errors in other files (16 warnings); changed files pass.

## Screenshots

- [Desktop](./navigation-desktop.png)
- [Mobile](./navigation-mobile.png)
