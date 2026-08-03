# Agent-Ready Landing Section — Design Spec

**Date:** 2026-08-03  
**Status:** Approved for planning  
**Branch:** `feat/premium-ecosystem-redesign`  
**Replaces:** Landing Live example / code workbench / manifesto morph slot (middle landing section)

## Goal

Replace the middle landing section with a quiet, editorial proof that Mario Charts is easy for AI coding agents (Cursor, Claude, Copilot, etc.) because the source lives in the user’s project.

Emotional target: clarity and confidence — not a demo toy, not another chart.

## Page context

Landing flow on the premium redesign:

1. World entrance → Hero field  
2. Chart index  
3. **Agent-ready section** (this)  
4. CTA  
5. Footer  

Must match `DESIGN.md`: flat surfaces, one-pixel dividers / `border-b`, Geist Sans + Mono, no floating cards, no decorative chart playground.

## Experience

### Content

| Slot | Copy (v1) |
|------|-----------|
| Eyebrow | Built for agents |
| Headline | Your AI already knows how to edit this. |
| Support | The component lives in your repo — Cursor, Claude, Copilot, and friends just open the file. |
| Bullet 1 title | Copy-paste, not a black box |
| Bullet 1 body | The chart ships as source in `@/components`, not behind an opaque npm package. |
| Bullet 2 title | Plain React + Tailwind |
| Bullet 2 body | No DSL, no magic config file — agents edit familiar code. |
| Bullet 3 title | Typed props |
| Bullet 3 body | Orientation, variant, showGrid, and the rest autocomplete without inventing an API. |
| Prompt (copyable) | Add a Mario Charts BarChart for monthly revenue. Vertical, filled, showGrid. Put it in components/charts. |
| Prompt action | Copy prompt |

### Layout

- Section with `border-b`, padding consistent with Chart Index / CTA (`py-16 lg:py-24`).  
- Single column, max-width ~2xl–3xl for prose; bullets in a simple vertical list (or tight 1-col stack on mobile).  
- No cards, no browser chrome, no side-by-side chart.  
- Prompt lives in a mono block with a **Copy prompt** control (reuse existing patterns like `CommandSnippet` / `CodeBlock` copy if they fit; otherwise a minimal bordered mono panel).

### Interaction

- Copy prompt → clipboard + brief “Copied” feedback.  
- No prop toggles, no morph, no live chart in this section.  
- Honor `prefers-reduced-motion` on feedback micro-animation only.

## Architecture

### Suggested modules

Replace the current middle-section mount (`ManifestoMorphSection` or residual `CodeDemoSection`) with:

```
components/landing/agent-ready/
  agent-ready-section.tsx   # section shell + copy + bullets + prompt
  agent-ready-prompt.tsx    # copyable prompt panel (optional split)
  agent-ready-content.ts    # eyebrow, headline, bullets, prompt string
  index.ts
```

### Integration

- `app/landing-content.tsx`: render `AgentReadySection` in the middle slot.  
- `components/landing/index.ts`: export `AgentReadySection`; stop exporting `ManifestoMorphSection` from the barrel (files under `manifesto-morph/` and `code-demo/` may remain on disk for a follow-up delete).  

### Out of scope

- Fake Cursor/Claude chat UI  
- CLI terminal theater  
- Live chart / workbench props  
- Deleting `code-demo/**` or `manifesto-morph/**` (follow-up)  

## Accessibility

- Real heading hierarchy (`h2` for headline).  
- Bullets as list (`ul`/`li`) with visible text (icons decorative / `aria-hidden`).  
- Copy button has accessible name; announce copied state via text change or polite live region.  

## Success criteria

- [ ] Middle landing section no longer shows Live example workbench or manifesto chart morph  
- [ ] Agent-ready copy + 3 bullets + copyable prompt ship  
- [ ] Visual language matches premium redesign (no card chrome)  
- [ ] Copy prompt works  
- [ ] No primary CTA competing with `CTASection`  

## Open decisions (resolved)

| Topic | Decision |
|-------|----------|
| Section job | Agent-ready confidence |
| Format | Checklist + copyable prompt (option 3) |
| Chart in section | None |
| Branch | `feat/premium-ecosystem-redesign` |
