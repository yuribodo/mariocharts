# AreaChart retirement

After reviewing the AreaChart refactor, the user chose to remove the standalone component: LineChart already supports an optional area fill, and a second component duplicated much of its rendering and interaction model.

AreaChart source, stories, exports, registry entry, navigation links, and install commands are removed. The registry now publishes 11 charts. Old HTML and markdown documentation URLs permanently redirect to LineChart documentation. The old area-chart registry item is removed rather than silently installing a different component.

Use the existing LineChart API for an ordinary filled trend:

```tsx
import { LineChart } from "@/components/charts/line-chart";

<LineChart data={data} x="month" y="revenue" showArea showDots={false} />;
```

The standalone `stacked`, `gradient`, and `areaOpacity` options are retired; they were not added to LineChart. Stacked-area behavior is therefore no longer a published capability. Applications needing cumulative composition can use StackedBarChart. Existing copied AreaChart source in consumer projects is unaffected until consumers migrate it themselves.

The shared Cartesian geometry and measured inspection tooltip remain in use by LineChart. Area-specific stacking helpers and their unfinished distribution artifacts were removed. The original research findings remain historical evidence, not a list of current exports.
