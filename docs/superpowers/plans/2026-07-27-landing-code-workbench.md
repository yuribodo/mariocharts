# Landing Code Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing code-to-preview workbench so the displayed source is generated from live state and renders through a real `BarChart`, replacing the bespoke SVG and the pre-design-system card layout.

**Architecture:** One connected frame divided by one-pixel dividers. `code-demo-section.tsx` owns the state (`orientation`, `variant`, `animation`, `chartKey`) and passes it to `workbench-code.tsx` (generated source plus controls) and `workbench-preview.tsx` (a real `BarChart`). Two shared components are lifted first so both the landing and the Bar Chart documentation page consume one implementation: `SegmentedControl` moves out of `bar-chart-content.tsx`, and `CodeBlock` gains line highlighting, a copy callback, and a shared Shiki highlighter.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Shiki, Lucide React, Framer Motion, Jest, Testing Library.

## Global Constraints

- Work in the worktree `.worktrees/premium-ecosystem-redesign` on branch `feat/premium-ecosystem-redesign`.
- Radii stay between 4px and 8px: `rounded`, `rounded-md`. Never `rounded-xl` or `rounded-2xl`.
- Connected regions use one-pixel dividers with no gap. No floating cards.
- No `backdrop-blur`, no decorative shadows. `shadow-lg` is forbidden in these files.
- No raw Tailwind color literals (`bg-red-500`, `text-green-600`). Use semantic tokens or `var(--chart-*)`.
- UI transitions run 150ms to 220ms with exponential ease-out. Honour `motion-reduce`.
- Data palette colors are reserved for data. They are not page decoration.
- Large display type is reserved for the hero. Section headings stay at `text-2xl`/`text-3xl` with `font-semibold`.
- Touch targets stay at least 44px (`min-h-11` / `size-11` / `min-h-10` inside an expanded hit area).
- Tests are colocated as `*.test.tsx`.
- `lib/chart-paths.ts` must not be deleted. `hero/morphing-chart.tsx`, `showcase/showcase-chart.tsx`, `hooks/use-morphing-chart.ts`, and `hooks/use-showcase-chart.ts` still import it.
- `components/landing/showcase/*` is out of scope for this plan.

---

### Task 1: Lift SegmentedControl into the shared UI layer

`SegmentedControl` is currently a private function at the bottom of
`app/docs/components/bar-chart/bar-chart-content.tsx`. The workbench needs the
same control, so it moves to `components/ui/` before anything consumes it.

The component renders exactly two options: the sliding indicator is
`w-[calc(50%-0.375rem)]` inside a `grid-cols-2` track. Keep that constraint and
document it rather than generalising now.

**Files:**
- Create: `components/ui/segmented-control.tsx`
- Create: `components/ui/segmented-control.test.tsx`
- Modify: `app/docs/components/bar-chart/bar-chart-content.tsx`

**Interfaces:**
- Produces: `SegmentedControl<T extends string>(props: { label: string; description: string; value: T; options: readonly SegmentedOption<T>[]; onChange: (value: T) => void })` and `SegmentedOption<T extends string> = { readonly value: T; readonly label: string; readonly icon: LucideIcon }`, both exported from `components/ui/segmented-control.tsx`.

- [ ] **Step 1: Write the failing test**

Create `components/ui/segmented-control.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { ChartBar, ChartColumn } from "lucide-react";

import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "vertical", label: "Vertical", icon: ChartColumn },
  { value: "horizontal", label: "Horizontal", icon: ChartBar },
] as const;

function renderControl(value: "vertical" | "horizontal", onChange = jest.fn()) {
  render(
    <SegmentedControl
      label="Orientation"
      description="Direction of comparison."
      value={value}
      options={options}
      onChange={onChange}
    />,
  );
  return onChange;
}

describe("SegmentedControl", () => {
  it("exposes the active option and its group name", () => {
    renderControl("vertical");

    expect(screen.getByRole("group", { name: "Orientation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertical" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Horizontal" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      document.querySelector('[data-segmented-indicator="Orientation"]'),
    ).toHaveAttribute("data-position", "left");
  });

  it("moves the indicator when the value changes", () => {
    renderControl("horizontal");

    expect(
      document.querySelector('[data-segmented-indicator="Orientation"]'),
    ).toHaveAttribute("data-position", "right");
  });

  it("reports the clicked option", () => {
    const onChange = renderControl("vertical");

    fireEvent.click(screen.getByRole("button", { name: "Horizontal" }));

    expect(onChange).toHaveBeenCalledWith("horizontal");
  });

  it("wraps around with the arrow keys", () => {
    const onChange = renderControl("vertical");

    fireEvent.keyDown(screen.getByRole("button", { name: "Vertical" }), {
      key: "ArrowLeft",
    });

    expect(onChange).toHaveBeenCalledWith("horizontal");
  });

  it("keeps the description available to the user", () => {
    renderControl("vertical");

    expect(screen.getByText("Direction of comparison.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd .worktrees/premium-ecosystem-redesign
npx jest components/ui/segmented-control.test.tsx
```

Expected: FAIL — `Cannot find module './segmented-control'`.

- [ ] **Step 3: Create the shared component**

Create `components/ui/segmented-control.tsx` with the implementation moved
verbatim from `bar-chart-content.tsx`, now exported:

```tsx
"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon: LucideIcon;
}

/**
 * Two-option segmented control.
 *
 * The sliding indicator is sized for exactly two options
 * (`w-[calc(50%-0.375rem)]` inside a `grid-cols-2` track). Passing a different
 * number of options will misplace it.
 */
export function SegmentedControl<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
}) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + options.length) % options.length;
    const nextOption = options[nextIndex];
    if (!nextOption) return;

    onChange(nextOption.value);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div role="group" aria-label={label} className="relative mt-2 grid grid-cols-2 gap-1 rounded-md border bg-muted/45 p-1">
        <span
          aria-hidden="true"
          data-segmented-indicator={label}
          data-position={activeIndex === 0 ? "left" : "right"}
          className={cn(
            "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded bg-background shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
            activeIndex === 1 && "translate-x-[calc(100%+0.25rem)]",
          )}
        />
        {options.map((option, index) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative z-10 inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded text-xs font-medium transition-[color,opacity] duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
      <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">{description}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/ui/segmented-control.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Rewire the Bar Chart documentation page**

In `app/docs/components/bar-chart/bar-chart-content.tsx`:

1. Delete the local `SegmentedOption` interface and `SegmentedControl` function
   at the bottom of the file (everything after the closing `}` of
   `BarChartContent`).
2. Add the import next to the other `components/ui` imports:

```tsx
import { SegmentedControl } from "../../../../components/ui/segmented-control";
```

3. Remove `import type { LucideIcon } from "lucide-react";` from line 4 if no
   other code in the file still references `LucideIcon`. The `productionStates`
   entries use `icon: LoaderCircle` inferred structurally, so check with:

```bash
grep -n 'LucideIcon' app/docs/components/bar-chart/bar-chart-content.tsx
```

Delete the import only when that returns nothing after step 1.

- [ ] **Step 6: Verify the documentation page still passes its own test**

```bash
npx jest app/docs/components/bar-chart components/ui/segmented-control
```

Expected: PASS. `bar-chart-content.test.tsx` already asserts the segmented
control behavior (`aria-pressed`, `data-segmented-indicator`, `ArrowLeft`), so
it protects the move.

- [ ] **Step 7: Typecheck and commit**

```bash
npx tsc --noEmit
git add components/ui/segmented-control.tsx components/ui/segmented-control.test.tsx app/docs/components/bar-chart/bar-chart-content.tsx
git commit -m "Extract Shared Segmented Control"
```

---

### Task 2: Give CodeBlock a shared highlighter, line highlighting, and a copy callback

Three changes to `components/ui/code-block.tsx`, all needed by the workbench and
all harmless to the documentation pages.

**The performance fix is the important one.** The current effect depends on
`[code, language, resolvedTheme]` and calls `createHighlighter({ themes: [2], langs: [8] })`
inside it, disposing on cleanup. For documentation that runs once per mount. The
workbench regenerates `code` on every control change, so as written each toggle
would bootstrap Shiki from scratch. Hoist the highlighter to a module-level
promise shared by every instance.

Because the highlighter becomes shared, the component must stop disposing it on
unmount — one instance unmounting would otherwise break every other instance.
The existing test asserts disposal, so that test is replaced here.

**Files:**
- Modify: `components/ui/code-block.tsx`
- Modify: `components/ui/code-block.test.tsx`

**Interfaces:**
- Produces: `CodeBlock(props: { code: string; language?: string; className?: string; highlightedLines?: readonly number[]; onCopy?: () => void })`. `highlightedLines` holds 1-based line numbers. `onCopy` fires only after a successful clipboard write.

- [ ] **Step 1: Write the failing tests**

Replace the `"highlights with the resolved theme and disposes the highlighter"`
test in `components/ui/code-block.test.tsx` with the three tests below, and add
the other two. Keep the existing copy-announcement and github-light tests as
they are.

```tsx
  it("reuses one highlighter across instances", async () => {
    const { createHighlighter } = jest.requireMock("shiki");

    render(<CodeBlock code="const a = 1;" language="typescript" />);
    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const a = 1;",
        expect.objectContaining({ theme: "dracula" }),
      );
    });
    const callsAfterFirst = createHighlighter.mock.calls.length;

    render(<CodeBlock code="const b = 2;" language="typescript" />);
    await waitFor(() => {
      expect(codeToHtml).toHaveBeenCalledWith(
        "const b = 2;",
        expect.objectContaining({ theme: "dracula" }),
      );
    });

    expect(createHighlighter.mock.calls.length).toBe(callsAfterFirst);
  });

  it("keeps the shared highlighter alive after an instance unmounts", async () => {
    const { unmount } = render(
      <CodeBlock code="const value = 1;" language="typescript" />,
    );

    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());
    unmount();

    expect(dispose).not.toHaveBeenCalled();
  });

  it("marks the requested lines through a shiki transformer", async () => {
    render(
      <CodeBlock
        code={"const a = 1;\nconst b = 2;"}
        language="typescript"
        highlightedLines={[2]}
      />,
    );

    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());

    const options = codeToHtml.mock.calls.at(-1)?.[1];
    const lineTransformer = options.transformers.find(
      (transformer: { line?: unknown }) => typeof transformer.line === "function",
    );
    expect(lineTransformer).toBeDefined();

    const first = { properties: {} as Record<string, unknown> };
    const second = { properties: {} as Record<string, unknown> };
    lineTransformer.line(first, 1);
    lineTransformer.line(second, 2);

    expect(first.properties["data-highlighted"]).toBeUndefined();
    expect(second.properties["data-highlighted"]).toBe("true");
  });

  it("reports a successful copy to its caller", async () => {
    const onCopy = jest.fn();
    render(
      <CodeBlock code="const value = 1;" language="typescript" onCopy={onCopy} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1));
  });

  it("does not report a copy that failed", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
    });
    const onCopy = jest.fn();
    render(
      <CodeBlock code="const value = 1;" language="typescript" onCopy={onCopy} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Unable to copy code");
    });
    expect(onCopy).not.toHaveBeenCalled();
  });
```

The mock at the top of the file also needs `codeToHtml` to record its options, which it already does, and `dispose` must be cleared between tests. Update `beforeEach`:

```tsx
  beforeEach(() => {
    mockResolvedTheme = "dark";
    codeToHtml.mockClear();
    dispose.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest components/ui/code-block.test.tsx
```

Expected: FAIL — `dispose` is still called on unmount, `transformers` has no
`line` hook, and `onCopy` is not a recognised prop.

- [ ] **Step 3: Hoist the highlighter to module scope**

In `components/ui/code-block.tsx`, add above `export function CodeBlock`:

```tsx
type Highlighter = Awaited<ReturnType<typeof createHighlighter>>;

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * One highlighter for the whole app.
 *
 * `createHighlighter` loads two themes and eight grammars. The workbench
 * regenerates its source on every control change, so creating one per render
 * would bootstrap Shiki on every click. Instances share this promise and none
 * of them dispose it.
 */
function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "dracula"],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "bash",
        "json",
        "css",
        "html",
      ],
    });
  }

  return highlighterPromise;
}
```

- [ ] **Step 4: Widen the props and rewrite the highlight effect**

Replace the `CodeBlockProps` interface:

```tsx
interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  /** 1-based line numbers to tint. */
  highlightedLines?: readonly number[];
  /** Fires only after a successful clipboard write. */
  onCopy?: () => void;
}
```

Update the signature:

```tsx
export function CodeBlock({
  code,
  language = "bash",
  className,
  highlightedLines,
  onCopy,
}: CodeBlockProps) {
```

Replace the whole highlight `useEffect` (currently lines 39-85) with:

```tsx
  // `highlightedLines` is an array prop, so a caller re-rendering with a fresh
  // literal would restart highlighting on every render. Depend on its contents.
  const highlightKey = highlightedLines?.join(",") ?? "";

  useEffect(() => {
    let cancelled = false;

    const highlight = async () => {
      try {
        const highlighter = await getHighlighter();
        if (cancelled) return;

        const lines = highlightKey === "" ? [] : highlightKey.split(",").map(Number);
        const theme: CodeTheme = resolvedTheme === "dark" ? "dracula" : "github-light";
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme,
          transformers: [
            {
              pre(node) {
                node.properties.style = "";
                node.properties.class = "shiki-themed";
              },
            },
            {
              line(node, line) {
                if (lines.includes(line)) {
                  node.properties["data-highlighted"] = "true";
                }
              },
            },
          ],
        });

        if (!cancelled) setHighlightedCode({ html, theme });
      } catch {
        if (!cancelled) setHighlightedCode(null);
      }
    };

    void highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language, resolvedTheme, highlightKey]);
```

Note what is deliberately absent: there is no `setHighlightedCode(null)` when
`code` changes, so the previous markup stays on screen until the new markup
resolves. That is what keeps rapid toggling from flashing an empty code region.

- [ ] **Step 5: Fire the copy callback**

In `copyToClipboard`, call `onCopy` only on the success path:

```tsx
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("success");
      onCopy?.();
    } catch {
      setCopyState("error");
    }
```

- [ ] **Step 6: Style the highlighted line**

In the `highlightedCode` branch, extend the wrapper `cn(...)` so tinted lines
read as full-width bands. `className` stays on the outer frame only — do not
add it here:

```tsx
        <div
          className={cn(
            "[&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:border-none [&>pre]:p-5 [&>pre]:text-sm [&_code]:font-mono",
            "[&_.line]:-mx-5 [&_.line]:block [&_.line]:px-5 [&_.line]:transition-colors [&_.line]:duration-200 [&_.line]:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:[&_.line]:transition-none",
            isDarkCode
              ? "[&>pre]:bg-[#282a36] [&_.line[data-highlighted]]:bg-[#44475a]"
              : "[&>pre]:bg-[#f6f8fa] [&_.line[data-highlighted]]:bg-[#e7edf3]",
          )}
          dangerouslySetInnerHTML={{ __html: highlightedCode.html }}
        />
```

The negative margin plus matching padding lets the tint span the full width of
the scroll container while the code keeps its `p-5` inset.

- [ ] **Step 7: Run the tests to verify they pass**

```bash
npx jest components/ui/code-block.test.tsx
```

Expected: PASS, 7 tests.

- [ ] **Step 8: Confirm no documentation page regressed**

```bash
npx jest app/docs components/ui
```

Expected: PASS.

- [ ] **Step 9: Typecheck and commit**

```bash
npx tsc --noEmit
git add components/ui/code-block.tsx components/ui/code-block.test.tsx
git commit -m "Share Code Highlighter and Add Line Emphasis"
```

---

### Task 3: Build the workbench preview

A thin wrapper that renders a real `BarChart` with the workbench's data and an
accessible name. Keeping it separate from the code column means the section can
mock it in tests without mocking the chart library everywhere.

**Files:**
- Create: `components/landing/code-demo/workbench-data.ts`
- Create: `components/landing/code-demo/workbench-preview.tsx`
- Create: `components/landing/code-demo/workbench-preview.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `workbench-data.ts` exports `monthlyRevenue`, `chartColors`, `type Orientation = "vertical" | "horizontal"`, `type Variant = "filled" | "outline"`, and `buildWorkbenchCode(state: WorkbenchState): string` plus `PROP_LINES`.
  - `workbench-preview.tsx` exports `WorkbenchPreview(props: { orientation: Orientation; variant: Variant; animation: boolean; chartKey: number })`.

- [ ] **Step 1: Write the failing test**

Create `components/landing/code-demo/workbench-preview.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { WorkbenchPreview } from "./workbench-preview";

jest.mock("@/src/components/charts/bar-chart", () => ({
  BarChart: ({
    orientation,
    variant,
    animation,
  }: {
    orientation?: string;
    variant?: string;
    animation?: boolean;
  }) => (
    <div data-testid="bar-chart">
      {orientation}:{variant}:{String(animation)}
    </div>
  ),
}));

describe("WorkbenchPreview", () => {
  it("passes the workbench state straight through to the chart", () => {
    render(
      <WorkbenchPreview
        orientation="horizontal"
        variant="outline"
        animation={false}
        chartKey={0}
      />,
    );

    expect(screen.getByTestId("bar-chart")).toHaveTextContent(
      "horizontal:outline:false",
    );
  });

  it("names the preview region for assistive technology", () => {
    render(
      <WorkbenchPreview
        orientation="vertical"
        variant="filled"
        animation
        chartKey={0}
      />,
    );

    expect(
      screen.getByRole("figure", { name: "Monthly revenue bar chart" }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/code-demo/workbench-preview.test.tsx
```

Expected: FAIL — `Cannot find module './workbench-preview'`.

- [ ] **Step 3: Create the shared workbench data and code generator**

Create `components/landing/code-demo/workbench-data.ts`:

```ts
export type Orientation = "vertical" | "horizontal";
export type Variant = "filled" | "outline";

export interface WorkbenchState {
  orientation: Orientation;
  variant: Variant;
  animation: boolean;
}

export const monthlyRevenue = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7200 },
] as const;

export const chartColors = [
  "var(--chart-blue)",
  "var(--chart-green)",
  "var(--chart-amber)",
  "var(--chart-coral)",
  "var(--chart-violet)",
  "var(--chart-cyan)",
];

/**
 * 1-based line numbers of each controllable prop in `buildWorkbenchCode`.
 *
 * Every prop keeps its own line in every state — `animation` renders as
 * `animation` or `animation={false}` rather than disappearing — so these
 * numbers stay fixed and the tinted line never points at the wrong prop.
 */
export const PROP_LINES = {
  orientation: 7,
  variant: 8,
  animation: 9,
} as const;

export function buildWorkbenchCode({
  orientation,
  variant,
  animation,
}: WorkbenchState): string {
  return `import { BarChart } from "@/components/charts/bar-chart";

<BarChart
  data={monthlyRevenue}
  x="month"
  y="revenue"
  orientation="${orientation}"
  variant="${variant}"
  animation${animation ? "" : "={false}"}
  showGrid
/>`;
}
```

- [ ] **Step 4: Create the preview component**

Create `components/landing/code-demo/workbench-preview.tsx`:

```tsx
"use client";

import { BarChart } from "@/src/components/charts/bar-chart";
import { chartColors, monthlyRevenue, type Orientation, type Variant } from "./workbench-data";

interface WorkbenchPreviewProps {
  orientation: Orientation;
  variant: Variant;
  animation: boolean;
  /** Bump to replay the entrance animation. */
  chartKey: number;
}

export function WorkbenchPreview({
  orientation,
  variant,
  animation,
  chartKey,
}: WorkbenchPreviewProps) {
  return (
    <figure
      role="figure"
      aria-label="Monthly revenue bar chart"
      className="m-0 h-[320px] min-w-0 p-5 sm:h-[380px] sm:p-8"
    >
      <BarChart
        key={chartKey}
        data={monthlyRevenue}
        x="month"
        y="revenue"
        colors={chartColors}
        orientation={orientation}
        variant={variant}
        animation={animation}
        showGrid
      />
    </figure>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx jest components/landing/code-demo/workbench-preview.test.tsx
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Verify the generated source shape**

Confirm `PROP_LINES` matches `buildWorkbenchCode` output:

```bash
npx tsx -e "import {buildWorkbenchCode} from './components/landing/code-demo/workbench-data'; console.log(buildWorkbenchCode({orientation:'vertical',variant:'filled',animation:true}).split('\n').map((l,i)=>(i+1)+' '+l).join('\n'))"
```

Expected: line 7 is `  orientation="vertical"`, line 8 is `  variant="filled"`,
line 9 is `  animation`.

- [ ] **Step 7: Typecheck and commit**

```bash
npx tsc --noEmit
git add components/landing/code-demo/workbench-data.ts components/landing/code-demo/workbench-preview.tsx components/landing/code-demo/workbench-preview.test.tsx
git commit -m "Add Workbench Chart Preview"
```

---

### Task 4: Build the workbench code column

The generated source, the controls beneath it, and the line tint that connects
them.

**Deviation from the spec, deliberate.** The spec says the workbench's copy
button should adopt the `CommandSnippet` pattern. `CodeBlock` already implements
that exact pattern — a copy button, `idle`/`success`/`error` states, and a
`role="status"` `aria-live` region — so this task reuses `CodeBlock`'s button
instead of building a second one, and hangs the badge unlock on the `onCopy`
callback added in Task 2. The user-facing behavior the spec asked for is
unchanged; there is simply one fewer copy implementation.

**Files:**
- Create: `components/landing/code-demo/workbench-code.tsx`
- Create: `components/landing/code-demo/workbench-code.test.tsx`

**Interfaces:**
- Consumes: `SegmentedControl` and `SegmentedOption` from `components/ui/segmented-control`; `CodeBlock` with `highlightedLines` and `onCopy` from `components/ui/code-block`; `buildWorkbenchCode`, `PROP_LINES`, `Orientation`, `Variant` from `./workbench-data`.
- Produces: `WorkbenchCode(props: { orientation: Orientation; variant: Variant; animation: boolean; onOrientationChange: (value: Orientation) => void; onVariantChange: (value: Variant) => void; onAnimationChange: (value: boolean) => void; onReplay: () => void })`.

- [ ] **Step 1: Write the failing test**

Create `components/landing/code-demo/workbench-code.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";

import { WorkbenchCode } from "./workbench-code";

const unlock = jest.fn();

jest.mock("@/hooks", () => ({
  useBadges: () => ({ unlock }),
}));

jest.mock("@/components/ui/code-block", () => ({
  CodeBlock: ({
    code,
    highlightedLines,
    onCopy,
  }: {
    code: string;
    highlightedLines?: readonly number[];
    onCopy?: () => void;
  }) => (
    <div>
      <pre>{code}</pre>
      <span data-testid="highlighted">{(highlightedLines ?? []).join(",")}</span>
      <button type="button" onClick={onCopy}>
        Copy code
      </button>
    </div>
  ),
}));

function renderCode(overrides: Partial<Parameters<typeof WorkbenchCode>[0]> = {}) {
  const props = {
    orientation: "vertical" as const,
    variant: "filled" as const,
    animation: true,
    onOrientationChange: jest.fn(),
    onVariantChange: jest.fn(),
    onAnimationChange: jest.fn(),
    onReplay: jest.fn(),
    ...overrides,
  };
  render(<WorkbenchCode {...props} />);
  return props;
}

describe("WorkbenchCode", () => {
  beforeEach(() => {
    unlock.mockClear();
  });

  it("renders source that matches the current state", () => {
    renderCode({ orientation: "horizontal", variant: "outline", animation: false });

    const source = screen.getByText(/import \{ BarChart \}/);
    expect(source).toHaveTextContent('orientation="horizontal"');
    expect(source).toHaveTextContent('variant="outline"');
    expect(source).toHaveTextContent("animation={false}");
  });

  it("reports control changes to its parent", () => {
    const props = renderCode();

    fireEvent.click(screen.getByRole("button", { name: "Horizontal" }));
    expect(props.onOrientationChange).toHaveBeenCalledWith("horizontal");

    fireEvent.click(screen.getByRole("button", { name: "Outline" }));
    expect(props.onVariantChange).toHaveBeenCalledWith("outline");

    fireEvent.click(screen.getByRole("checkbox", { name: "Animate" }));
    expect(props.onAnimationChange).toHaveBeenCalledWith(false);
  });

  it("tints the source line belonging to the control that changed", () => {
    const { rerender } = render(
      <WorkbenchCode
        orientation="vertical"
        variant="filled"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("");

    rerender(
      <WorkbenchCode
        orientation="vertical"
        variant="outline"
        animation
        onOrientationChange={jest.fn()}
        onVariantChange={jest.fn()}
        onAnimationChange={jest.fn()}
        onReplay={jest.fn()}
      />,
    );

    expect(screen.getByTestId("highlighted")).toHaveTextContent("8");
  });

  it("unlocks the first-copy badge without any celebration", () => {
    renderCode();

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    expect(unlock).toHaveBeenCalledWith("first-copy");
  });

  it("disables replay while the animation is off", () => {
    renderCode({ animation: false });

    expect(screen.getByRole("button", { name: "Replay animation" })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/code-demo/workbench-code.test.tsx
```

Expected: FAIL — `Cannot find module './workbench-code'`.

- [ ] **Step 3: Create the component**

Create `components/landing/code-demo/workbench-code.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChartBar, ChartColumn, RotateCcw, Square, SquareDashed } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { CodeBlock } from "@/components/ui/code-block";
import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import { useBadges } from "@/hooks";
import {
  buildWorkbenchCode,
  PROP_LINES,
  type Orientation,
  type Variant,
} from "./workbench-data";

const orientationOptions: readonly SegmentedOption<Orientation>[] = [
  { value: "vertical", label: "Vertical", icon: ChartColumn },
  { value: "horizontal", label: "Horizontal", icon: ChartBar },
];

const appearanceOptions: readonly SegmentedOption<Variant>[] = [
  { value: "filled", label: "Filled", icon: Square },
  { value: "outline", label: "Outline", icon: SquareDashed },
];

/** How long a changed source line stays tinted before fading back. */
const TINT_DURATION_MS = 700;

interface WorkbenchCodeProps {
  orientation: Orientation;
  variant: Variant;
  animation: boolean;
  onOrientationChange: (value: Orientation) => void;
  onVariantChange: (value: Variant) => void;
  onAnimationChange: (value: boolean) => void;
  onReplay: () => void;
}

export function WorkbenchCode({
  orientation,
  variant,
  animation,
  onOrientationChange,
  onVariantChange,
  onAnimationChange,
  onReplay,
}: WorkbenchCodeProps) {
  const { unlock } = useBadges();
  const shouldReduceMotion = useReducedMotion();
  const [tintedLines, setTintedLines] = useState<readonly number[]>([]);
  const previous = useRef({ orientation, variant, animation });
  const tintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tint the line belonging to whichever prop just changed. Derived from the
  // props rather than from the control handlers so the tint is correct even
  // when state changes from somewhere else.
  useEffect(() => {
    const before = previous.current;
    previous.current = { orientation, variant, animation };

    if (shouldReduceMotion) return;

    const changed =
      before.orientation !== orientation
        ? PROP_LINES.orientation
        : before.variant !== variant
          ? PROP_LINES.variant
          : before.animation !== animation
            ? PROP_LINES.animation
            : null;

    if (changed === null) return;

    if (tintTimer.current) clearTimeout(tintTimer.current);
    setTintedLines([changed]);
    tintTimer.current = setTimeout(() => setTintedLines([]), TINT_DURATION_MS);
  }, [orientation, variant, animation, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (tintTimer.current) clearTimeout(tintTimer.current);
    };
  }, []);

  const code = buildWorkbenchCode({ orientation, variant, animation });

  return (
    <div className="flex min-w-0 flex-col">
      {/*
        Below `lg` the section stacks chart, controls, then code, so the
        controls come first here and the grid places the chart above both.
        From `lg` up the column reads code then controls.
      */}
      <div className="order-2 min-w-0 flex-1 lg:order-1">
        <CodeBlock
          code={code}
          language="tsx"
          highlightedLines={tintedLines}
          onCopy={() => unlock("first-copy")}
          className="my-0 rounded-none border-0"
        />
      </div>

      <div
        className="order-1 border-b p-5 lg:order-2 lg:border-b-0 lg:border-t"
        aria-label="Chart settings"
        role="group"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SegmentedControl
            label="Orientation"
            description="Direction of comparison."
            value={orientation}
            options={orientationOptions}
            onChange={onOrientationChange}
          />
          <SegmentedControl
            label="Appearance"
            description="Visual weight of the bars."
            value={variant}
            options={appearanceOptions}
            onChange={onVariantChange}
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={animation}
              onChange={(event) => onAnimationChange(event.target.checked)}
              className="size-4 accent-foreground"
            />
            Animate
          </label>
          <button
            type="button"
            onClick={onReplay}
            disabled={!animation}
            className="inline-flex size-11 items-center justify-center rounded border bg-background text-muted-foreground transition-colors duration-150 hover:text-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            aria-label="Replay animation"
            title="Replay animation"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/landing/code-demo/workbench-code.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Typecheck and commit**

```bash
npx tsc --noEmit
git add components/landing/code-demo/workbench-code.tsx components/landing/code-demo/workbench-code.test.tsx
git commit -m "Add Workbench Code Column"
```

---

### Task 5: Assemble the connected frame and retire the old surface

Rewrite the section as one frame, replace the heading copy, and delete the files
the new structure makes obsolete.

**Files:**
- Modify: `components/landing/code-demo/code-demo-section.tsx`
- Create: `components/landing/code-demo/code-demo-section.test.tsx`
- Delete: `components/landing/code-demo/demo-card.tsx`
- Delete: `components/landing/code-demo/interactive-code.tsx`
- Delete: `components/landing/code-demo/live-preview.tsx`
- Delete: `components/landing/code-demo/types.ts`
- Modify: `components/landing/code-demo/index.ts`

**Interfaces:**
- Consumes: `WorkbenchCode` from `./workbench-code`, `WorkbenchPreview` from `./workbench-preview`, `Orientation` and `Variant` from `./workbench-data`.
- Produces: `CodeDemoSection(props: { className?: string })` — unchanged public shape, so `app/landing-content.tsx` needs no edit.

- [ ] **Step 1: Write the failing test**

Create `components/landing/code-demo/code-demo-section.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";

import { CodeDemoSection } from "./code-demo-section";

jest.mock("@/src/components/charts/bar-chart", () => ({
  BarChart: ({ orientation, variant }: { orientation?: string; variant?: string }) => (
    <div data-testid="bar-chart">
      {orientation}:{variant}
    </div>
  ),
}));

jest.mock("@/components/ui/code-block", () => ({
  CodeBlock: ({ code }: { code: string }) => <pre data-testid="source">{code}</pre>,
}));

jest.mock("@/hooks", () => ({
  useBadges: () => ({ unlock: jest.fn() }),
}));

describe("CodeDemoSection", () => {
  it("leads with the connection between code and chart", () => {
    render(<CodeDemoSection />);

    expect(
      screen.getByRole("heading", {
        name: "Adjust the props. The code updates with the chart.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is the component you install — same props, same output."),
    ).toBeInTheDocument();
  });

  it("moves the source and the chart together", () => {
    render(<CodeDemoSection />);

    expect(screen.getByTestId("source")).toHaveTextContent('orientation="vertical"');
    expect(screen.getByTestId("bar-chart")).toHaveTextContent("vertical:filled");

    fireEvent.click(screen.getByRole("button", { name: "Horizontal" }));

    expect(screen.getByTestId("source")).toHaveTextContent('orientation="horizontal"');
    expect(screen.getByTestId("bar-chart")).toHaveTextContent("horizontal:filled");
  });

  it("uses connected surfaces instead of floating cards", () => {
    const { container } = render(<CodeDemoSection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("rounded-2xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
  });
});
```

The negative assertion deliberately allows the segmented control's
`shadow-[0_1px_2px_rgba(0,0,0,0.08)]`. That one-pixel shadow marks a thumb that
physically slides over the track, which `DESIGN.md` permits as a real layering
cue. `shadow-lg` is what the old cards used and is what must not come back.

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/landing/code-demo/code-demo-section.test.tsx
```

Expected: FAIL — the heading is still `Copy. Paste. Ship.`

- [ ] **Step 3: Rewrite the section**

Replace the whole contents of `components/landing/code-demo/code-demo-section.tsx`:

```tsx
"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { WorkbenchCode } from "./workbench-code";
import { WorkbenchPreview } from "./workbench-preview";
import type { Orientation, Variant } from "./workbench-data";

interface CodeDemoSectionProps {
  className?: string;
}

/**
 * Landing code workbench.
 *
 * Owns the workbench state so the generated source and the rendered chart can
 * never disagree: both read the same values.
 */
export function CodeDemoSection({ className }: CodeDemoSectionProps) {
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [variant, setVariant] = useState<Variant>("filled");
  const [animation, setAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);

  return (
    <section
      aria-labelledby="workbench-title"
      className={cn("border-b py-16 lg:py-24", className)}
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Live example
        </p>
        <h2
          id="workbench-title"
          className="mt-3 max-w-2xl text-2xl font-semibold tracking-normal text-foreground sm:text-3xl"
        >
          Adjust the props. The code updates with the chart.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          This is the component you install — same props, same output.
        </p>

        <div className="mt-8 grid overflow-hidden rounded-md border bg-card lg:grid-cols-2">
          <div className="order-2 border-t lg:order-1 lg:border-r lg:border-t-0">
            <WorkbenchCode
              orientation={orientation}
              variant={variant}
              animation={animation}
              onOrientationChange={setOrientation}
              onVariantChange={setVariant}
              onAnimationChange={setAnimation}
              onReplay={() => setChartKey((key) => key + 1)}
            />
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <WorkbenchPreview
              orientation={orientation}
              variant={variant}
              animation={animation}
              chartKey={chartKey}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

The `order-*` classes deliver the responsive rule from the spec: one column
below `lg` puts the chart first, two columns above `lg` put the code first.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/landing/code-demo/code-demo-section.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Delete the obsolete files**

```bash
git rm components/landing/code-demo/demo-card.tsx components/landing/code-demo/interactive-code.tsx components/landing/code-demo/live-preview.tsx components/landing/code-demo/types.ts
```

- [ ] **Step 6: Update the barrel**

`components/landing/code-demo/index.ts` currently reads:

```ts
export { CodeDemoSection } from "./code-demo-section";
export { InteractiveCode } from "./interactive-code";
export { LivePreview } from "./live-preview";
export { DemoCard } from "./demo-card";
export { DEMO_CONFIG, getDefaultConfig } from "./types";
export type { DemoConfig, DemoConfigKey } from "./types";
```

Replace it entirely with:

```ts
export { CodeDemoSection } from "./code-demo-section";
```

`WorkbenchCode`, `WorkbenchPreview`, and `workbench-data` are internal to the
section and are not re-exported.

Then confirm no stragglers:

```bash
grep -rn 'interactive-code\|live-preview\|demo-card\|DEMO_CONFIG\|getDefaultConfig\|InteractiveCode\|LivePreview\|DemoCard' --include=*.ts --include=*.tsx app components hooks lib
```

Expected: no output.

- [ ] **Step 7: Drop the dead confetti preset**

`canvas-confetti` stays in `package.json`: `components/landing/easter-eggs/party-mode.tsx`
still imports it and uses `confettiConfig.party`.

Only the `copy` preset dies with `interactive-code.tsx`. Remove it from
`confettiConfig` in `lib/animations.ts`:

```ts
  copy: {
    particleCount: 30,
    spread: 50,
    origin: { y: 0.8, x: 0.5 },
    colors: ["#22c55e", "#4ade80", "#86efac"],
  },
```

Leave the `default` and `party` presets untouched. Confirm nothing else
referenced it:

```bash
grep -rn 'confettiConfig.copy' --include=*.ts --include=*.tsx app components hooks lib
```

Expected: no output.

- [ ] **Step 8: Typecheck and commit**

```bash
npx tsc --noEmit
git add -A components/landing/code-demo
git commit -m "Redesign Landing Code Workbench"
```

---

### Task 6: Verify the slice end to end

**Files:**
- Verify: `components/landing/code-demo/*`
- Verify: `components/ui/segmented-control.tsx`
- Verify: `components/ui/code-block.tsx`

- [ ] **Step 1: Run the release gates**

```bash
npx tsc --noEmit
npx eslint components/landing/code-demo components/ui/segmented-control.tsx components/ui/code-block.tsx
npx jest --runInBand
```

Expected: typecheck clean, no new ESLint errors, the full suite green with the
five new test files included.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Drive the real page**

```bash
npm run dev
```

Open `http://localhost:3000` and confirm, in light and dark:

- Changing Orientation or Appearance updates the source line and the bars together.
- The changed source line tints briefly, then fades.
- Rapid toggling never blanks the code region.
- Copy announces success, and a denied clipboard shows the error state.
- Replay is disabled while Animate is off.
- Keyboard alone reaches every control with a visible focus ring, and arrow keys move within each segmented control.

- [ ] **Step 4: Capture screenshots**

Capture after the chart has rendered, at `1440x1000` and `390x844`, in light and
dark. Confirm the frame has no gap between regions, no nested cards, and the
chart is neither blank nor clipped.

- [ ] **Step 5: Verify reduced motion**

Enable the OS reduced-motion setting, reload, and confirm the line tint and the
chart entrance animation are gone while every control and all content remain.

- [ ] **Step 6: Push**

```bash
git push origin feat/premium-ecosystem-redesign
```
