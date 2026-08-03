# Installation

> Install Mario Charts charts into any React + Tailwind project with the shadcn CLI. No Mario Charts runtime package required.

## Prerequisites

- React 18+
- Tailwind CSS
- A project with `components.json` (run `npx shadcn@latest init` if needed)

## Quick install

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

Dependencies resolve automatically. The only npm package a chart adds is `framer-motion` (plus `clsx` and `tailwind-merge` for `cn`).

## Namespace registry (optional)

Add to `components.json`:

```json
{
  "registries": {
    "@mariocharts": "https://mariocharts.com/r/{name}.json"
  }
}
```

Then:

```bash
npx shadcn@latest add @mariocharts/line-chart
```

## CLI package

The `mario-charts` npm CLI mirrors the same registry for offline/fallback installs:

```bash
npx mario-charts@latest init
npx mario-charts@latest add bar-chart
```

## Next steps

- [Component index](https://mariocharts.com/docs/components.md)
- [Bar Chart](https://mariocharts.com/docs/components/bar-chart.md)
- [llms.txt](https://mariocharts.com/llms.txt)

HTML version: https://mariocharts.com/docs/installation
