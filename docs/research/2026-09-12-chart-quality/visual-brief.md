# Visual brief: chart quality proposal

This image was generated with the built-in image generation tool for research only. It is not an implementation or a screenshot of Mario Charts. Current screenshots are linked in the main report.

![Proposed chart behavior in the existing visual direction](assets/chart-quality-proposal.png)

## What to compare

1. The revenue card shows explicit units, an anchored inspection tooltip, and a visible focus treatment.
2. The trend card leaves a real visual gap for March, rather than inventing a zero or joining observations without disclosure.
3. The narrow card shows the same information hierarchy with inspection content inside the available width.

Typography, dark neutrals, chart blue, restrained borders, and light-theme compatibility follow the existing product direction. A single series color and optional data-view link are proposals to discuss, not approved changes to the default API or palette.

The image is illustrative: its invented data differs from the current screenshot dataset, geometry is approximate, and font identity cannot be established from a generated raster. Do not use it as a pixel-perfect regression fixture. Use the report's semantic contracts to specify exact paths and values. Mobile inspection shown here is one candidate pattern, not a settled interaction design.

## Original generation prompt

```text
Use case: ui-mockup. Asset type: chart-quality research concept, not implemented UI or a screenshot. Create a polished, realistic 3-panel chart component proposal, landscape image, clear legible typography, no device mockups or marketing decorations. Mario Charts existing identity: Geist sans with restrained Geist Mono small captions, warm charcoal dark surfaces #151410 / #100f0c, warm off-white text, delicate neutral borders, modest 6px corner rounding. Blue #559af7 primary, green #55bc87 secondary. Preserve simple SVG-like chart aesthetics. Main header exact text "Mario Charts · behavior-first refinement"; small subheading "Concept proposal · same visual identity". Left wide panel dark theme: card title "Revenue", subtitle "Jan–Jun 2026 · USD", quiet top-right "View data"; 6 vertical blue bars ascending from a clearly labeled zero baseline, subtle horizontal dotted grid, x labels Jan Feb Mar Apr May Jun, y labels $0 $2k $4k $6k $8k. One bar highlighted with crisp thin focus outline and anchored tooltip exact text "Apr" and "$6,100". No oversized KPI. Center wide panel dark theme: card title "Revenue trend", subtitle "A missing month stays missing"; single blue line rising Jan to Feb, then a genuine EMPTY GAP across Mar, separate new path Apr through Jun. NO line connecting Feb to Apr. Small hollow endpoint markers. x labels Jan Feb Mar Apr May Jun. Label "Mar · No observation" under plot. Footer exact text "Missing values are not zero". Right narrow mobile-width panel in warm white #faf9f6 with fine light gray border, same typographic hierarchy: title "Revenue"; subtitle "USD · Jan–Jun"; six blue bars compactly spaced, modest axis label density, within bounds. An inspection summary below the chart, within card bounds, exact text "Apr     $6,100", then small "View data". Keep plot visually dominant, controls secondary. This is a product component comparison sheet, no code, no new feature badges, no gradients or glow, no fake browser chrome. Small bottom caption "Proposed states, not production screenshots".
```
