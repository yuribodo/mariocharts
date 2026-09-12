# Mario Charts

> A React chart library for dashboards, built with TypeScript and Tailwind CSS. Copy chart components into your project through shadcn and own the source.

## For AI agents

- Start here: https://mariocharts.com/docs/ai-agents.md — chart selection, setup, and working revenue chart and dashboard examples
- Full index: https://mariocharts.com/llms.txt
- Full reference (props included): https://mariocharts.com/llms-full.txt
- Registry index: https://mariocharts.com/r/registry.json
- Every page on this site has a markdown twin — append `.md` to any URL, or send `Accept: text/markdown`.

Install the Mario Charts skill in your project to give your coding agent chart
selection and API guidance:

```bash
npx skills add yuribodo/mariocharts --skill mario-charts
```

## Install a chart

```bash
npx shadcn@latest add https://mariocharts.com/r/<chart-name>.json
```

Example:

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

## Site pages (markdown)

- [Home](https://mariocharts.com/index.md)
- [Docs](https://mariocharts.com/docs.md)
- [Installation](https://mariocharts.com/docs/installation.md)
- [Components](https://mariocharts.com/docs/components.md)
- [Examples](https://mariocharts.com/examples.md)
- [Sales dashboard](https://mariocharts.com/examples/dashboards/sales.md)
- [Analytics dashboard](https://mariocharts.com/examples/dashboards/analytics.md)

## Stack

React 18+, TypeScript, Tailwind CSS, Framer Motion, and clsx / tailwind-merge for shared styling helpers.
