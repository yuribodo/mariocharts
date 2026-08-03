# Manifesto Morph Section — Design Spec

**Date:** 2026-08-03  
**Status:** Approved for planning  
**Replaces:** Landing `CodeDemoSection` (“Copy. Paste. Ship.” prop playground)

## Goal

Replace the landing code-demo block with a single craft moment: editorial typography that morphs into a real LineChart. The visitor should feel “caramba, que craft” — not learn an API.

## Page context

Landing flow stays:

1. Hero — morphing chart impact  
2. Showcase — sticky chart catalog  
3. **Manifesto Morph** (this section)  
4. CTA  
5. Footer  

This section must not repeat Hero (chart-type morphing) or Showcase (catalog / sticky scroll catalog). It sells belief through craft, not features.

## Experience

### Sequence

1. **Idle** — Large centered editorial headline. Generous whitespace. No cards, no browser chrome, no code panel.  
2. **Morph** — Triggered once when the section enters view (or on scroll progress into the section). Glyphs open tracking, fragment, and travel into chart geometry (points + stroke path). Duration ~1.2–1.8s.  
3. **Settled** — A real `LineChart` remains interactive (subtle hover). Sparse supporting line under the chart. No primary CTA (CTA section follows).

### Emotional target

Astonishment at craft. Manifesto that *becomes* the product.

### Out of scope

- Prop toggles / fake AreaChart API  
- Code editor, copy-code confetti, CLI theater  
- AI prompt → chart  
- Multi-chart switching in this section  
- Aggressive CTA buttons inside the section  

## Content

| Slot | Copy (v1) |
|------|-----------|
| Headline (pre-morph) | Own the pixels. |
| Support (post-morph) | Charts you keep — not another dependency. |

Copy is editable in one place; motion must not hardcode string length assumptions beyond a small max (≈20 characters) for layout safety.

## Visual & motion

### Layout

- Single centered column, full section padding (`py` consistent with other landing sections).  
- No cards, borders-as-chrome, or split panes.  
- The morph stage is the composition.

### Chart

- Use the real **LineChart** component from `src/components/charts/line-chart`.  
- Fixed demo dataset (e.g. monthly series), chosen for a clear silhouette after morph.  
- Defaults only — no playground controls.

### Morph principles

- Prefer compositor-friendly props: `transform`, `opacity` (and SVG path drawing where needed).  
- Interruptible: if the user scrolls away mid-morph, cancel cleanly; do not leave a broken half-state (jump to settled or reverse to idle).  
- Play **once per visit** (session flag or in-memory flag on the landing page).  
- After settle, allow micro-interactions on the chart only — do not restart the morph on hover.  
- Honor `prefers-reduced-motion`: crossfade headline → LineChart; skip glyph fragmentation.

### Reduced motion

```
idle headline → fade out
LineChart → fade in
support line → fade in
```

## Architecture

### New modules (suggested)

```
components/landing/manifesto-morph/
  manifesto-morph-section.tsx   # section shell, trigger, copy
  glyph-morph.tsx               # headline → particles → targets
  settled-line-chart.tsx        # real LineChart + demo data
  types.ts                      # MorphPhase, config
  index.ts
```

### Integration

- `app/landing-content.tsx`: swap `CodeDemoSection` for `ManifestoMorphSection`.  
- `components/landing/index.ts`: export the new section.  
- Stop mounting InteractiveCode / LivePreview on the landing page.  
- Existing `components/landing/code-demo/**` may remain unused for now (delete or archive in a follow-up; not required for MVP of this section).

### State machine

```
idle → morphing → settled
```

- `idle`: headline visible  
- `morphing`: glyph animation running (ignore re-triggers)  
- `settled`: LineChart mounted/visible; support copy visible  

Persistence: once `settled` in the session, subsequent mounts of the landing show settled state (or skip morph) to avoid replaying on back-navigation if desired. Minimum: do not loop while the section stays in view.

### Data

Static demo series colocated with `settled-line-chart.tsx`, e.g.:

```ts
const DEMO_SERIES = [
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 5100 },
  // ...
] as const;
```

## Success criteria

- [ ] No prop playground on the landing path  
- [ ] Morph uses a real LineChart after settle  
- [ ] Reduced-motion path works without fragmentation  
- [ ] Morph runs at most once per visit  
- [ ] Section has no primary CTA competing with `CTASection`  
- [ ] Lighthouse / a11y: headline remains readable to AT (announce belief; chart has accessible name)  

## Accessibility

- Headline is real text (not only canvas) until morph starts; after morph, expose an accessible name on the chart region (e.g. `aria-label` describing the demo series).  
- Do not rely on motion alone for meaning — support line states the belief in text.  
- Keyboard: no trap; chart interactions follow existing LineChart a11y.

## Open decisions (resolved)

| Topic | Decision |
|-------|----------|
| Section job | Craft astonishment via manifesto morph |
| Chart type | LineChart |
| Headline | Own the pixels. |
| Support line | Charts you keep — not another dependency. |
| Code demo | Removed from landing composition |

## Follow-ups (not this PR)

- Delete or repurpose `components/landing/code-demo/**` if unused elsewhere  
- Optional: alternate headlines via simple config  
- Optional: scroll-scrubbed morph (explicitly deferred; in-view trigger is MVP)
