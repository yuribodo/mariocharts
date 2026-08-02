# Registry + AI Discoverability — Design

**Date:** 2026-08-02
**Status:** Approved, ready for implementation planning
**Branch:** `yuribodo/Improve-GEO-and-SEO`

## Problem

An AI coding agent asked to "add a chart to this React project" has no viable path to
Mario Charts today.

The hosted registry the CLI points at does not exist:

```
https://mariocharts.com/registry/index.json  → 404
https://mariocharts.com/r/bar-chart.json     → 404
https://mariocharts.com/llms.txt             → 200
https://mariocharts.com/sitemap.xml          → 200
```

`packages/cli/src/utils/registry.ts` sets `DEFAULT_REGISTRY_URL` to
`https://mariocharts.com/registry`, gets a 404 on every call, and silently falls back to
the registry embedded at build time. The CLI works, but nothing is discoverable over
HTTP. An agent cannot list the components, cannot fetch one, and cannot install one
without already knowing the exact `npx mario-charts@latest add <name>` incantation.

Three documents actively mislead agents that do find the project:

| Source | Claim | Reality |
|---|---|---|
| `README.md:31` | `npx mario-charts@latest add bar-chart kpi-card` | `kpi-card` does not exist anywhere in the repo |
| `AGENTS.md:6` | registry metadata lives in `packages/registry` | Only `packages/cli` exists |
| `packages/cli` | registry served at `/registry` | 404 |

Each is an agent that tried and failed.

The component list is also duplicated by hand across four files, and three have already
drifted:

| File | Charts listed |
|---|---|
| `packages/cli/scripts/generate-fallback-registry.js` | 12 (reads real source files) |
| `public/llms.txt` | 6 |
| `public/llms-full.txt` | 7 |
| `app/sitemap.ts` | 6 |

Six shipped charts — area, funnel, gauge, heatmap, treemap, waterfall — are invisible to
both AI retrieval and search engines.

## Goal

Make an AI agent able to discover, understand, and install Mario Charts components with
zero prior knowledge beyond a web search.

Explicitly **not** a goal: getting models to recommend Mario Charts from memory. At 55
npm downloads/month there is no training-data presence to leverage. The bet is on
runtime retrieval — being correct and installable at the moment an agent looks.

## Research basis

- [llmstxt.org](https://llmstxt.org/) — `llms.txt` format: H1, blockquote summary,
  optional prose, H2-delimited link lists.
- [Fern](https://buildwithfern.com/post/best-llms-txt-implementation-platforms-ai-discoverable-apis)
  — files must be auto-generated and kept in sync; a stale `llms.txt` is worse than
  none. Serve markdown instead of HTML to AI user-agents to cut token cost.
- [shadcn registry docs](https://ui.shadcn.com/docs/registry) — third-party registries,
  `registry-item.json` schema, namespaces in `components.json`, MCP integration.
- [Context7](https://context7.com/add-library) — indexes libraries from GitHub, website,
  or `llms.txt`; serves them over MCP to Cursor, Claude Code, Codex. Ranks by a trust
  score derived from stars and activity.
- [Enrich Labs GEO guide](https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026)
  — answer-first content, question-shaped headers, visible update dates.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Priority channel | Install channel (registry) | Highest conversion per impression; does not depend on pre-existing traction |
| Registry format | shadcn `registry-item.json` at `/r/*.json` | `npx shadcn@latest add <url>` works with zero user config; shadcn MCP can browse it via namespace |
| Own MCP server | Deferred | Requires the user to install and configure a server — too much friction at current scale |
| Own CLI | Untouched this phase | Stays on the embedded fallback, which works. Migrating it to the shadcn schema is a separate spec |
| Generation | Own generator emits everything | `npx shadcn build` cannot reproduce the existing `ChartTooltip.tsx` → `chart-tooltip.tsx` rename and barrel-import rewrite |

## Architecture

One manifest, four outputs.

`packages/cli/scripts/generate-fallback-registry.js` already is the real source of truth:
it declares all 12 charts plus `lib-utils`, `lib-hooks`, and `chart-shared`, and reads
their content from disk. Promote it out of the CLI package to `registry/manifest.js` at
the repo root, and have a single `npm run build:registry` emit:

```
registry/manifest.js  (source of truth)
        │
        ├──► packages/cli/src/utils/fallback-generated.ts   (existing behavior)
        ├──► public/r/<name>.json                            (new — shadcn registry-item)
        ├──► public/r/registry.json                          (new — shadcn index)
        └──► public/llms.txt + public/llms-full.txt          (regenerated)
```

`app/sitemap.ts` imports the chart list from the manifest instead of hardcoding it.

The invariant is enforced in CI: run the generator, then `git diff --exit-code` on every
generated file. Adding a chart without regenerating fails the build rather than
silently shipping a stale `llms.txt`.

### Registry item shape

Static files under `public/r/` — no route handler, no runtime, fully cacheable.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "bar-chart",
  "type": "registry:component",
  "title": "Bar Chart",
  "description": "A customizable bar chart component with animations, hover effects, responsive design, and support for both vertical and horizontal orientations with filled or outline variants",
  "author": "Yuri Bodo",
  "dependencies": ["framer-motion", "clsx", "tailwind-merge"],
  "registryDependencies": ["https://mariocharts.com/r/chart-shared.json"],
  "files": [
    {
      "path": "bar-chart/index.tsx",
      "type": "registry:component",
      "target": "~/components/charts/bar-chart/index.tsx",
      "content": "..."
    }
  ],
  "categories": ["charts", "dashboard"],
  "docs": "https://mariocharts.com/docs/components/bar-chart"
}
```

`registryDependencies` uses absolute URLs — the schema supports them — so
`chart-shared`, `lib-utils`, and `lib-hooks` resolve automatically with no user
configuration.

### Install paths unlocked

Ordered by friction:

1. **Zero config** — `npx shadcn@latest add https://mariocharts.com/r/bar-chart.json`.
   Works in any project with a `components.json`. The agent only needs the URL. This is
   the path that matters.
2. **Namespace** — user adds
   `"registries": { "@mariocharts": "https://mariocharts.com/r/{name}.json" }` to
   `components.json`, then the shadcn MCP server can list, search, and install
   `@mariocharts/bar-chart` conversationally.
3. **Own CLI** — `npx mario-charts add bar-chart` keeps working off the embedded
   fallback, unchanged.

## Discovery

Serving `/r/*.json` is useless if nothing points at it. Every entry point leads to one
canonical install snippet, character-for-character identical:

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

It appears in five places: top of `README.md`, `/docs/installation`, `llms.txt`, the
`docs` field of every registry item, and each chart's doc page. Literal repetition across
independent sources is what makes a model treat the command as fact rather than
invention.

### Deliverables

1. **`llms.txt` / `llms-full.txt` regenerated** — all 12 charts, each with both its
   registry-item URL and its docs URL. Adds an `## Installing (for AI agents)` section
   with the exact command, and a **"When NOT to recommend Mario Charts"** section. The
   negative section is deliberate: a model that knows the boundaries recommends more
   confidently inside them, and avoids the bad recommendation that burns the library.

2. **`app/robots.ts`** — explicit allow rules for `GPTBot`, `OAI-SearchBot`,
   `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, and `Google-Extended`,
   plus a reference to `/llms.txt`. The wildcard already permits them; explicit rules are
   a signal and prevent a future `disallow` from breaking this silently.

3. **`app/sitemap.ts`** — 6 → 12 component routes, derived from the manifest.

4. **Markdown endpoints** — `/docs/components/<name>.md` serving each chart as plain
   markdown. Generated, static. Cuts token cost and strips HTML/navigation noise for AI
   consumers.

   These are **generated from source, not scraped from the TSX docs pages** (which are
   700+ line React components). Each file contains the title, description, the canonical
   install command, the npm dependencies, and the chart's real props interface extracted
   from source by brace-matching `interface <Name>Props`. Verified 2026-08-02: this
   extraction succeeds for all 12 charts — 10 from `index.tsx`, and `radar-chart` and
   `scatter-plot` from their `types.ts`. Because the interface is read from the same file
   the registry ships, the documented API cannot drift from the installed component.

5. **Anti-signal fixes** — cheapest work in the plan, likely the highest impact:
   - `README.md:31` — remove the non-existent `kpi-card` from the install example.
   - `AGENTS.md:6` — `packages/registry` does not exist; correct the pointer.
   - `packages/cli/src/utils/registry.ts` — point `DEFAULT_REGISTRY_URL` at a URL that
     resolves, or document the fallback-only behavior as intentional.

6. **Context7 submission** — submit at `context7.com/add-library` pointing at the repo
   and `llms.txt`. External manual step, performed after merge. Their trust score keys
   off stars and activity, so this channel improves on its own over time.

## Testing

CI already runs typecheck, jest with coverage, and build. Add:

- **Sync test** — run the generator, `git diff --exit-code` on all generated files. The
  drift is simulated by editing the manifest, not the output, so the test exercises the
  real failure mode.
- **Shape validation** — assert the invariants directly in Jest rather than pulling in a
  JSON Schema validator: required fields present and non-empty, `type` within the allowed
  set, every file carrying a `path`, `type`, `target`, and non-empty `content`, and every
  `registryDependency` URL resolving to a document this build actually emits. That last
  assertion is the one a generic schema validator could not make, and it is the one that
  catches a broken install.
- **Install verification** — `npx shadcn@latest add https://mariocharts.com/r/bar-chart.json`
  into a fresh `create-next-app` project, then `tsc --noEmit`. This runs against the
  **deployed** registry, so it is a post-merge manual step rather than a PR gate; CI
  carries an advisory job that fetches the live endpoints and checks their shape.
- **Link test** — every `mariocharts.com` URL cited in `llms.txt` returns 200. Advisory in
  CI for the same reason.

## Risks

- ~~**Nested `target` paths.**~~ **Resolved 2026-08-02.** The shadcn docs show nested
  targets in their own examples (`@ui/ai/prompt-input.tsx`), so
  `@components/charts/bar-chart/index.tsx` is valid. Use the `@components/` and `@lib/`
  placeholders rather than `~/`, so paths resolve through the consumer's
  `components.json` aliases instead of being pinned to the project root.
- **Two registry formats coexisting.** The CLI's custom format and the shadcn format both
  derive from one manifest, so they cannot drift — but the CLI stays on its embedded copy
  this phase, meaning a chart added between CLI releases is installable via shadcn and
  not via `mario-charts add`. Accepted.
- **Ceiling.** Nothing here makes a model recall Mario Charts unprompted. The expected
  outcome is being correct and installable when an agent searches, not being remembered
  without one.

## Out of scope

Recorded for later specs:

- Own MCP server (`mario-charts-mcp`) with list/search/add tools.
- Content GEO: comparison pages, FAQ sections with schema markup, answer-first docs
  restructuring — the channel that eventually gets Mario Charts named in ChatGPT and
  Perplexity answers.
- Migrating `packages/cli` to consume the shadcn schema.
