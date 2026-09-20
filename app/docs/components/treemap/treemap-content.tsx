"use client";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  TreeMapChart,
  type TreeMapNode,
  type TreeMapLayout,
  type TreeMapVariant,
} from "@/src/components/charts/treemap-chart";
import { APIReference } from "@/components/ui/api-reference";
import { CodeBlock } from "@/components/ui/code-block";
import { CommandSnippet } from "@/components/ui/command-snippet";
const revenue: readonly TreeMapNode[] = [
  {
    name: "Software",
    children: [
      { name: "Desktop", value: 300 },
      { name: "Mobile", value: 200 },
      { name: "API", value: 100 },
    ],
  },
  {
    name: "Hardware",
    children: [
      { name: "Devices", value: 150 },
      { name: "Accessories", value: 100 },
    ],
  },
  {
    name: "Services",
    children: [
      { name: "Training", value: 90 },
      { name: "Support", value: 60 },
    ],
  },
];
function fixture(name: string): readonly TreeMapNode[] {
  if (name === "flat")
    return [
      { name: "Documents", value: 45 },
      { name: "Photos", value: 32 },
      { name: "Video", value: 28 },
      { name: "Applications", value: 18 },
      { name: "Music", value: 12 },
      { name: "Downloads", value: 8 },
    ];
  if (name === "deep")
    return [
      {
        name: "Equities",
        children: [
          {
            name: "North America",
            children: [
              {
                name: "Technology",
                children: [
                  { name: "Platform", value: 250 },
                  { name: "Devices", value: 180 },
                ],
              },
              { name: "Healthcare", value: 160 },
            ],
          },
          {
            name: "International",
            children: [
              { name: "Europe", value: 180 },
              { name: "Asia", value: 130 },
            ],
          },
        ],
      },
      {
        name: "Bonds",
        children: [
          { name: "Government", value: 220 },
          { name: "Corporate", value: 120 },
        ],
      },
    ];
  if (name === "repeated")
    return [
      {
        name: "Region",
        children: [
          { name: "Other", value: 60 },
          { name: "Other", value: 20 },
        ],
      },
      { name: "Region", children: [{ name: "Other", value: 40 }] },
    ];
  if (name === "many")
    return Array.from({ length: 120 }, (_, i) => ({
      name: `Item ${i + 1}`,
      value: 121 - i,
    }));
  if (name === "tiny")
    return [
      { name: "Main", value: 9999 },
      { name: "Small", value: 1 },
      { name: "Zero", value: 0 },
    ];
  if (name === "zero")
    return [
      { name: "A", value: 0 },
      { name: "B", value: 0 },
    ];
  if (name === "single") return [{ name: "Only category", value: 10 }];
  if (name === "equal")
    return Array.from({ length: 9 }, (_, i) => ({
      name: `Category ${i + 1}`,
      value: 10,
    }));
  if (name === "long")
    return revenue.map((group) => ({
      ...group,
      name: `${group.name} and international operations`,
      children: group.children!.map((node) => ({
        ...node,
        name: `${node.name} — enterprise customer accounts`,
      })),
    }));
  if (name === "negative") return [{ name: "Invalid", value: -10 }];
  if (name === "missing") return [{ name: "Missing value" }];
  if (name === "empty-group")
    return [{ name: "Empty group", children: [] }, ...revenue];
  return revenue;
}
const example = `import { TreeMapChart } from "@/components/charts/treemap-chart";

const revenue = [
  { name: "Software", children: [
    { name: "Desktop", value: 300 },
    { name: "Mobile", value: 200 },
    { name: "API", value: 100 },
  ] },
  { name: "Hardware", children: [
    { name: "Devices", value: 150 },
    { name: "Accessories", value: 100 },
  ] },
];

export function RevenueComposition() {
  return <TreeMapChart data={revenue} layout="squarified"
    variant="nested" height={400} ariaLabel="Revenue composition" />;
}`;
const props = [
  {
    name: "data",
    type: "readonly TreeMapNode[]",
    required: true,
    description:
      "Nodes have name, leaf value, optional children and CSS color. Groups sum their children, ignoring a supplied parent value. Empty children arrays without a value are valid zero groups. Other missing, negative or nonfinite leaf values are errors.",
  },
  {
    name: "layout",
    type: "'squarified' | 'binary' | 'slice-dice'",
    default: "'squarified'",
    description:
      "Squarified favors balanced rectangles. Binary makes balanced splits along the longer side. Slice-and-dice alternates direction at each level.",
  },
  {
    name: "variant",
    type: "'nested' | 'flat'",
    default: "'nested'",
    description:
      "Nested reserves group headers and insets. Flat places all leaves in the current view on one shared area scale and preserves their group colors and full paths.",
  },
  {
    name: "sort",
    type: "'value' | 'input'",
    default: "'value'",
    description:
      "Order tiles by descending value or preserve sibling input order. Original node identity and index paths remain unchanged.",
  },
  {
    name: "maxDepth",
    type: "number",
    default: "2",
    description:
      "Show 1–6 levels at once. Groups too small for a header collapse into one tile. Open a group to explore its children.",
  },
  {
    name: "drillDown",
    type: "boolean",
    default: "true",
    description:
      "Select a group to explore it. Breadcrumbs return to ancestors; Backspace returns from the chart. Fresh data arrays reset the view to the root.",
  },
  {
    name: "gap / borderRadius",
    type: "number",
    default: "3 / 4",
    description:
      "Spacing and corner radius, each 0–24px. Insets are capped relative to tile size. Set both to 0 for rectangular area comparison without gutters.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    description:
      "Palette assigned by original top-level order and inherited by descendants. A node's color overrides its branch. CSS variables, named colors and transparency are supported; label ink adapts to the resolved paint.",
  },
  {
    name: "showValues / showPercentages",
    type: "boolean",
    default: "true / false",
    description:
      "Display values and percent of the full hierarchy when a tile has room. Small tiles never gain artificial area to fit text; full information stays in inspection and View data.",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    description:
      "Format counts in labels, inspection, totals and the accessible data table.",
  },
  {
    name: "height / className",
    type: "number / string",
    default: "400",
    description:
      "Stable frame height (at least 120px) and root styling. Breadcrumbs and data controls are included in this height.",
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description:
      "Tiles grow around their centers with constant opacity. Hover and resize do not replay entrance. Reduced motion and keyboard focus finish immediately.",
  },
  {
    name: "loading / error",
    type: "boolean / string | null",
    description:
      "Refreshing keeps the current geometry. Initial loading uses grouped placeholder tiles. Empty, zero and error states retain the same root.",
  },
  {
    name: "onClick",
    type: "(node: TreeMapNode, path: readonly string[]) => void",
    description:
      "The original selected node and its full name path, including groups and zero values selected from View data. Works with pointer, touch and keyboard.",
  },
  {
    name: "tooltipRenderer",
    type: "(data: TreemapChartTooltipData<TreeMapNode>) => ReactNode",
    description:
      "Original node, name/index paths, depth, value, color and formatted value. percentage is relative to the full hierarchy; parentPercentage and viewPercentage expose local shares. Zero denominators return null.",
  },
  {
    name: "ariaLabel / description",
    type: "string",
    description: "Accessible chart name and optional explanation of your data.",
  },
];
export function TreeMapContent() {
  const [dataset, setDataset] = useState("revenue"),
    [state, setState] = useState("ready"),
    [palette, setPalette] = useState("default");
  const [layout, setLayout] = useState<TreeMapLayout>("squarified"),
    [variant, setVariant] = useState<TreeMapVariant>("nested"),
    [sort, setSort] = useState<"value" | "input">("value");
  const [depth, setDepth] = useState(2),
    [gap, setGap] = useState(3),
    [radius, setRadius] = useState(4),
    [values, setValues] = useState(true),
    [percentages, setPercentages] = useState(false),
    [drill, setDrill] = useState(true),
    [animation, setAnimation] = useState(true),
    [replay, setReplay] = useState(0),
    [selected, setSelected] = useState("");
  const data = useMemo(() => fixture(dataset), [dataset]);
  const colors = useMemo(
    () =>
      palette === "mono"
        ? ["#3b82f6"]
        : palette === "css"
          ? ["var(--primary)", "gold", "rebeccapurple"]
          : palette === "alpha"
            ? [
                "rgb(59 130 246 / .25)",
                "rgb(16 185 129 / .25)",
                "rgb(245 158 11 / .25)",
              ]
            : [],
    [palette],
  );
  const selectClass =
    "h-9 w-full rounded-md border bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const empty = state === "empty" || state === "initial-loading";
  return (
    <div className="min-w-0 space-y-10">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          TreeMap Chart
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          See how the parts fit together. Compare proportions, keep groups in
          context, and open a branch to explore what is inside.
        </p>
        <CommandSnippet command="npx mario-charts@latest add treemap-chart" />
      </header>
      <section className="space-y-5" aria-labelledby="tree-playground">
        <div>
          <h2
            id="tree-playground"
            className="text-xl font-semibold tracking-tight"
          >
            Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore the same values with three layouts and two hierarchy views.
          </p>
        </div>
        <div className="overflow-hidden rounded-md border bg-card">
          <div className="grid grid-cols-2 gap-4 border-b p-4 md:grid-cols-4">
            <label className="grid gap-2 text-xs">
              Layout
              <select
                aria-label="Layout"
                className={selectClass}
                value={layout}
                onChange={(e) => setLayout(e.target.value as TreeMapLayout)}
              >
                <option value="squarified">Squarified</option>
                <option value="binary">Binary</option>
                <option value="slice-dice">Slice and dice</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              View
              <select
                aria-label="View"
                className={selectClass}
                value={variant}
                onChange={(e) => setVariant(e.target.value as TreeMapVariant)}
              >
                <option value="nested">Nested groups</option>
                <option value="flat">Flat leaves</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Dataset
              <select
                aria-label="Dataset"
                className={selectClass}
                value={dataset}
                onChange={(e) => {
                  setDataset(e.target.value);
                  setSelected("");
                }}
              >
                {[
                  ["revenue", "Product revenue"],
                  ["flat", "Disk usage"],
                  ["deep", "Deep hierarchy"],
                  ["equal", "Equal values"],
                  ["many", "120 categories"],
                  ["tiny", "Tiny and zero"],
                  ["zero", "All zero"],
                  ["single", "Single category"],
                  ["repeated", "Repeated names"],
                  ["long", "Long labels"],
                  ["empty-group", "Empty group"],
                  ["negative", "Negative value"],
                  ["missing", "Missing value"],
                ].map(([value, title]) => (
                  <option key={value} value={value}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              State
              <select
                aria-label="State"
                className={selectClass}
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {[
                  ["ready", "Ready"],
                  ["loading", "Refreshing"],
                  ["initial-loading", "Initial loading"],
                  ["empty", "Empty"],
                  ["error", "Error"],
                ].map(([value, title]) => (
                  <option key={value} value={value}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Palette
              <select
                aria-label="Palette"
                className={selectClass}
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
              >
                <option value="default">By group</option>
                <option value="mono">Single color</option>
                <option value="css">CSS colors</option>
                <option value="alpha">Transparent colors</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Order
              <select
                aria-label="Order"
                className={selectClass}
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
              >
                <option value="value">Largest first</option>
                <option value="input">Input order</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Visible levels · {depth}
              <input
                aria-label="Visible levels"
                type="range"
                min={1}
                max={6}
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
              />
            </label>
            <label className="grid gap-2 text-xs">
              Gap · {gap}px
              <input
                aria-label="Gap"
                type="range"
                min={0}
                max={12}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b px-4 py-3 text-xs">
            <label className="flex items-center gap-2">
              Corners
              <input
                aria-label="Corners"
                className="w-20"
                type="range"
                min={0}
                max={16}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
            {[
              ["Values", values, setValues],
              ["Percentages", percentages, setPercentages],
              ["Explore groups", drill, setDrill],
              ["Animation", animation, setAnimation],
            ].map(([title, checked, setter]) => (
              <label key={String(title)} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked as boolean}
                  onChange={(e) =>
                    (setter as (value: boolean) => void)(e.target.checked)
                  }
                />
                {title as string}
              </label>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 rounded border px-3 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setReplay((v) => v + 1)}
            >
              <RotateCcw size={12} />
              Replay
            </button>
          </div>
          <div className="min-w-0 bg-background p-2 sm:p-5">
            <TreeMapChart
              key={replay}
              data={empty ? [] : data}
              colors={colors}
              layout={layout}
              variant={variant}
              sort={sort}
              maxDepth={depth}
              gap={gap}
              borderRadius={radius}
              showValues={values}
              showPercentages={percentages}
              drillDown={drill}
              animation={animation}
              loading={state === "loading" || state === "initial-loading"}
              error={
                state === "error"
                  ? "Unable to load composition. Try again."
                  : null
              }
              ariaLabel="Product composition"
              onClick={(node, path) =>
                setSelected(
                  `${path.join(" → ")} (${node.children?.length ? "group" : node.value})`,
                )
              }
            />
          </div>
          <p
            role="status"
            className="border-t px-4 py-3 text-xs text-muted-foreground"
          >
            {selected ||
              "Select a group to explore it. View data includes small and zero-valued observations."}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Arrow keys inspect tiles; Enter opens groups. Backspace returns to the
          parent. Zero values never occupy painted area.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Usage</h2>
        <CodeBlock code={example} language="tsx" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Choosing a layout
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [
              "Squarified",
              "Balanced blocks help compare areas and leave room for labels.",
            ],
            [
              "Binary",
              "Repeated balanced splits create a more structured subdivision.",
            ],
            [
              "Slice and dice",
              "Alternating strips reveal levels and preserve ordering, with narrower tiles.",
            ],
          ].map(([title, text]) => (
            <div key={title} className="border-t pt-3">
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Nested mode allocates area to groups first, then reserves headers and
          padding for their children. Compare siblings within a group. For
          direct area comparison across all leaves, choose Flat and set gap and
          corners to zero.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Reading the hierarchy
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Software totals 600 from its three children. Desktop is 300: 30% of
          the full 1,000 and 50% of Software. Opening Software changes the
          available area, while the global percentage stays at 30%; inspection
          also shows its 50% share of the current view.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Group colors stay attached to their original top-level branch when
          tiles move or you explore a group. Repeated names remain separate
          observations through their numeric index paths. A refreshed data array
          resets navigation to the root.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Missing values are errors; explicit zero values remain in View data.
          Empty groups are valid zero observations. Custom tooltip percentages
          are nullable for a zero total. The callback still receives the
          original node and full name path; inspection now also provides node,
          indexPath, depth and local percentages.
        </p>
      </section>
      <APIReference props={props} />
    </div>
  );
}
