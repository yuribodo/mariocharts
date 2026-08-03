# Mario Charts Docs

> Copy-paste React chart components with beautiful defaults, TypeScript props, and zero vendor lock-in.

## Start here

1. [Installation](https://mariocharts.com/docs/installation.md) — CLI or manual setup
2. [Components](https://mariocharts.com/docs/components.md) — all 12 charts
3. [llms.txt](https://mariocharts.com/llms.txt) — agent-oriented index
4. [llms-full.txt](https://mariocharts.com/llms-full.txt) — full props reference

## Install

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

Register the library namespace in `components.json` to use short names:

```json
{
  "registries": {
    "@mariocharts": "https://mariocharts.com/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @mariocharts/bar-chart
```

## What you get

Components are copied into your repo as editable source. No `@mariocharts/*` package stays in your dependency tree at runtime. Charts add `framer-motion` (plus `clsx` / `tailwind-merge` for the shared `cn` helper).

## HTML docs

Live interactive docs: https://mariocharts.com/docs
