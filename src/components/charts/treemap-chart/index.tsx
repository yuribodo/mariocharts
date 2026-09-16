"use client";
import {
  memo,
  useMemo,
  useState,
  useEffect,
  useRef,
  useId,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "../../../../lib/utils";
import {
  formatValue,
  useContainerDimensions,
  type TreemapChartTooltipData,
  type TooltipRenderer,
} from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import { buildTreeModel, DEFAULT_COLORS, type TreeEntry } from "./model";
import {
  layoutTree,
  type TreeMapNode,
  type LayoutRect,
  type TreeMapLayout,
  type TreeMapVariant,
} from "./layout";
import { useTreeInk } from "./ink";
export type { TreeMapNode, LayoutRect, TreeMapLayout, TreeMapVariant };
export { DEFAULT_COLORS };
export interface TreeMapChartProps {
  /** Hierarchical observations. Group totals derive from children, never add parent values. */
  readonly data: readonly TreeMapNode[];
  readonly colors?: readonly string[];
  readonly layout?: TreeMapLayout;
  /** Nested groups reserve headers; flat compares all leaf areas on one scale. */
  readonly variant?: TreeMapVariant;
  readonly sort?: "value" | "input";
  /** Levels shown at once, 1–6. Smaller groups collapse to an explorable tile. */
  readonly maxDepth?: number;
  readonly gap?: number;
  readonly borderRadius?: number;
  readonly showValues?: boolean;
  readonly showPercentages?: boolean;
  readonly drillDown?: boolean;
  readonly valueFormatter?: (value: number) => string;
  readonly ariaLabel?: string;
  readonly description?: string;
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly onClick?: (node: TreeMapNode, path: readonly string[]) => void;
  readonly tooltipRenderer?: TooltipRenderer<
    TreemapChartTooltipData<TreeMapNode>
  >;
}
const PLACEHOLDER = [
  {
    name: "Group A",
    children: [
      { name: "A", value: 45 },
      { name: "B", value: 25 },
    ],
  },
  {
    name: "Group B",
    children: [
      { name: "C", value: 20 },
      { name: "D", value: 10 },
    ],
  },
];
const rate = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(1)}%`;
function Growth({
  progress,
  x,
  y,
  index,
  count,
  children,
}: {
  progress: MotionValue<number>;
  x: number;
  y: number;
  index: number;
  count: number;
  children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const transform = (p: number) => {
    const delay = count > 1 ? (index / (count - 1)) * 0.18 : 0;
    const scale = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
    return `translate(${x * (1 - scale)} ${y * (1 - scale)}) scale(${scale})`;
  };
  useEffect(() => {
    const update = (p: number) => {
      const delay = count > 1 ? (index / (count - 1)) * 0.18 : 0;
      const scale = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
      ref.current?.setAttribute(
        "transform",
        `translate(${x * (1 - scale)} ${y * (1 - scale)}) scale(${scale})`,
      );
    };
    update(progress.get());
    return progress.on("change", update);
  }, [progress, x, y, index, count]);
  return (
    <g ref={ref} data-tree-growth="" transform={transform(progress.get())}>
      {children}
    </g>
  );
}
function TreeMapChartComponent({
  data,
  colors = DEFAULT_COLORS,
  layout = "squarified",
  variant = "nested",
  sort = "value",
  maxDepth = 2,
  gap = 3,
  borderRadius = 4,
  showValues = true,
  showPercentages = false,
  drillDown = true,
  valueFormatter = formatValue,
  ariaLabel = "Treemap chart",
  description,
  className,
  height = 400,
  loading = false,
  error = null,
  animation = true,
  onClick,
  tooltipRenderer,
}: TreeMapChartProps) {
  const [rootRef, width] = useContainerDimensions();
  const id = useId(),
    reduced = useReducedMotion();
  const model = useMemo(() => buildTreeModel(data, colors), [data, colors]);
  const placeholder = useMemo(() => buildTreeModel(PLACEHOLDER), []);
  const source = loading && (!data.length || model.error) ? placeholder : model;
  const paintColors = useMemo(
    () => [...new Set(source.entries.map((entry) => entry.color))],
    [source],
  );
  const inks = useTreeInk(rootRef, paintColors);
  const [view, setView] = useState<{
    data: readonly TreeMapNode[];
    key: string;
  } | null>(null);
  const viewEntry =
    view?.data === data ? source.byKey.get(view.key) : undefined;
  const scope = viewEntry?.children ?? source.roots,
    scopeTotal = viewEntry?.value ?? source.total;
  const scopeKey = viewEntry?.key ?? "root";
  const validHeight = Number.isFinite(height) && height >= 120;
  const frameHeight = validHeight ? height : 400;
  const validGap = Number.isFinite(gap) && gap >= 0 && gap <= 24;
  const validRadius =
    Number.isFinite(borderRadius) && borderRadius >= 0 && borderRadius <= 24;
  const validDepth =
    Number.isInteger(maxDepth) && maxDepth >= 1 && maxDepth <= 6;
  const validLayout = ["squarified", "binary", "slice-dice"].includes(layout);
  const validVariant = variant === "nested" || variant === "flat";
  const validSort = sort === "value" || sort === "input";
  const chartError =
    error ||
    model.error ||
    (!validHeight
      ? "height must be a finite number of at least 120 pixels."
      : !validGap
        ? "gap must be between 0 and 24 pixels."
        : !validRadius
          ? "borderRadius must be between 0 and 24 pixels."
          : !validDepth
            ? "maxDepth must be an integer from 1 to 6."
            : !validLayout
              ? "Choose squarified, binary or slice-dice layout."
              : !validVariant
                ? "Choose nested or flat variant."
                : !validSort
                  ? "sort must be value or input."
                  : null);
  const navigation =
    drillDown && source.entries.some((entry) => entry.children.length > 0);
  const top = navigation ? 36 : 0,
    plotHeight = Math.max(1, frameHeight - top - 32);
  const tiles = useMemo(
    () =>
      layoutTree(scope, width, plotHeight, {
        layout: validLayout ? layout : "squarified",
        variant: validVariant ? variant : "nested",
        sort: validSort ? sort : "value",
        maxDepth: validDepth ? maxDepth : 2,
        gap: validGap ? gap : 3,
      }),
    [
      scope,
      width,
      plotHeight,
      layout,
      variant,
      sort,
      maxDepth,
      gap,
      validLayout,
      validVariant,
      validSort,
      validDepth,
      validGap,
    ],
  );
  const ready = !loading && !chartError && width > 0 && scopeTotal > 0;
  const progress = useMotionValue(1);
  useEffect(() => {
    if (!ready || !animation || reduced) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.65,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [ready, animation, reduced, scopeKey, layout, variant, progress]);
  const [inspection, setInspection] = useState<string | null>(null),
    [focus, setFocus] = useState<string | null>(null),
    [tab, setTab] = useState(0),
    [tableOpen, setTableOpen] = useState(false);
  const refs = useRef<(SVGRectElement | null)[]>([]),
    pendingFocus = useRef(false),
    tableButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const index = refs.current.findIndex(
      (node) => node !== null && node === document.activeElement,
    );
    const key = index >= 0 ? (tiles[index]?.entry.key ?? null) : null;
    setFocus(key);
    setInspection(key);
    if (key) progress.jump(1);
    if (pendingFocus.current && ready) {
      pendingFocus.current = false;
      setTab(0);
      refs.current[0]?.focus();
    }
  }, [data, scopeKey, layout, variant, loading, error, ready, tiles, progress]);
  const active =
    !loading && !chartError && inspection
      ? source.byKey.get(inspection)
      : undefined;
  const activeTile = active
    ? tiles.find((tile) => tile.entry.key === active.key)
    : undefined;
  const tip: TreemapChartTooltipData<TreeMapNode> | null = active
    ? {
        node: active.node,
        name: active.node.name,
        value: active.value,
        formattedValue: valueFormatter(active.value),
        percentage: active.percentage,
        parentPercentage: active.parentPercentage,
        viewPercentage:
          scopeTotal > 0 ? (active.value / scopeTotal) * 100 : null,
        path: active.path,
        indexPath: active.indexPath,
        depth: active.depth,
        color: active.color,
      }
    : null;
  const descendants = useMemo(() => {
    const prefix = viewEntry ? `${viewEntry.key}.` : "";
    return source.entries.filter(
      (entry) => !prefix || entry.key.startsWith(prefix),
    );
  }, [source, viewEntry]);
  const crumbs = viewEntry
    ? viewEntry.indexPath.map(
        (_, i) =>
          source.byKey.get(viewEntry.indexPath.slice(0, i + 1).join("."))!,
      )
    : [];
  const go = (key: string | null, keyboard: boolean) => {
    pendingFocus.current = keyboard;
    setInspection(null);
    setFocus(null);
    setTableOpen(false);
    setView(key === null ? null : { data, key });
  };
  const select = (entry: TreeEntry, keyboard: boolean) => {
    setInspection(entry.key);
    onClick?.(entry.node, entry.path);
    if (drillDown && entry.children.length) go(entry.key, keyboard);
  };
  function navigate(event: KeyboardEvent<SVGRectElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    }
    if (event.key === "Backspace" && viewEntry) {
      event.preventDefault();
      go(crumbs.length > 1 ? crumbs[crumbs.length - 2]!.key : null, true);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(tiles[index]!.entry, true);
      return;
    }
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tiles.length - 1;
    else if (["ArrowRight", "ArrowDown"].includes(event.key))
      next = (index + 1) % tiles.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key))
      next = (index - 1 + tiles.length) % tiles.length;
    else return;
    event.preventDefault();
    setTab(next);
    refs.current[next]?.focus();
  }
  const message =
    !loading && chartError
      ? chartError
      : !loading && !data.length
        ? "No Data"
        : !loading && !scopeTotal
          ? "No positive values"
          : !loading && !width
            ? "Waiting for chart space"
            : null;
  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className)}
      style={{ height: frameHeight }}
      aria-busy={loading}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setInspection(focus);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInspection(null);
          setFocus(null);
        }
      }}
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading treemap
        </span>
      )}
      {navigation && (
        <nav
          aria-label="Treemap navigation"
          className="flex h-9 items-center gap-1 overflow-x-auto whitespace-nowrap text-xs"
        >
          <button
            type="button"
            disabled={loading}
            aria-current={!viewEntry ? "page" : undefined}
            className="rounded px-2 py-1 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(event) => go(null, event.detail === 0)}
          >
            All groups
          </button>
          {crumbs.map((entry, i) => (
            <span key={entry.key} className="flex items-center gap-1">
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
              <button
                type="button"
                disabled={loading}
                aria-current={i === crumbs.length - 1 ? "page" : undefined}
                className="max-w-40 truncate rounded px-2 py-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => go(entry.key, event.detail === 0)}
              >
                {entry.node.name}
              </button>
            </span>
          ))}
        </nav>
      )}
      {message ? (
        <div
          role={chartError ? "alert" : "status"}
          style={{ height: plotHeight }}
          className="flex items-center justify-center p-6 text-center"
        >
          <div>
            <p
              className={cn(
                "font-medium",
                chartError ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {chartError ? "Chart Error" : message}
            </p>
            {chartError && (
              <p className="mt-2 text-sm text-muted-foreground">{chartError}</p>
            )}
          </div>
        </div>
      ) : (
        <svg
          width={width}
          height={plotHeight}
          role={loading ? "presentation" : "group"}
          aria-hidden={loading || undefined}
          aria-label={ariaLabel}
          aria-describedby={`${id}-description`}
          onFocusCapture={() => progress.jump(1)}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setFocus(null);
              setInspection(null);
            }
          }}
        >
          <desc id={`${id}-description`}>
            {description ? `${description} ` : ""}Area represents nonnegative
            value before gutters. Nested groups reserve header space; flat
            compares all leaf allocations on one scale. Group totals sum
            children. Arrow keys inspect, Home/End jump, Escape dismisses,
            Enter/Space selects or opens groups, Backspace returns. View data
            includes zero and hidden observations.
          </desc>
          <rect
            width={width}
            height={plotHeight}
            rx={validRadius ? borderRadius : 4}
            aria-hidden="true"
            className="fill-muted"
          />
          <g
            className={cn(
              loading && "text-muted",
              loading &&
                animation &&
                !reduced &&
                "animate-pulse motion-reduce:animate-none",
            )}
          >
            {tiles.map((tile, index) => {
              const { entry } = tile,
                ink = inks[entry.color] ?? "#ffffff";
              const radius = Math.min(
                validRadius ? borderRadius : 4,
                tile.width / 4,
                tile.height / 4,
              );
              const labelVisible = tile.width >= 48 && tile.height >= 24;
              const metrics = [
                showValues ? valueFormatter(entry.value) : "",
                showPercentages ? rate(entry.percentage) : "",
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <g key={entry.key}>
                  {tile.expanded ? (
                    <rect
                      x={tile.x}
                      y={tile.y}
                      width={tile.width}
                      height={tile.height}
                      rx={radius}
                      data-tree-group={loading ? undefined : entry.key}
                      className="fill-muted"
                    />
                  ) : (
                    <Growth
                      progress={progress}
                      x={tile.x + tile.width / 2}
                      y={tile.y + tile.height / 2}
                      index={index}
                      count={tiles.length}
                    >
                      <rect
                        data-tree-tile={loading ? undefined : entry.key}
                        data-loading-tile={loading ? entry.key : undefined}
                        x={tile.x}
                        y={tile.y}
                        width={tile.width}
                        height={tile.height}
                        rx={radius}
                        fill={loading ? "currentColor" : entry.color}
                        aria-hidden="true"
                      />
                    </Growth>
                  )}
                  {labelVisible && (
                    <foreignObject
                      x={tile.x}
                      y={tile.y}
                      width={tile.width}
                      height={tile.expanded ? tile.headerHeight : tile.height}
                      pointerEvents="none"
                      aria-hidden="true"
                    >
                      {tile.expanded ? (
                        <div className="flex h-full min-w-0 items-center gap-2 px-2 text-xs text-foreground">
                          <span
                            className="size-2 shrink-0 rounded-sm bg-muted-foreground"
                            style={{
                              background: loading ? undefined : entry.color,
                            }}
                          />
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {loading ? "" : entry.node.name}
                          </span>
                          {metrics &&
                            tile.width >=
                              (showValues && showPercentages ? 220 : 140) &&
                            !loading && (
                              <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                                {metrics}
                              </span>
                            )}
                          {drillDown && !loading && (
                            <span aria-hidden="true">↗︎</span>
                          )}
                        </div>
                      ) : (
                        <div
                          data-tree-label=""
                          className="flex h-full min-w-0 flex-col items-center justify-center px-2 text-center"
                          style={{ color: ink, transition: "none" }}
                        >
                          {loading ? (
                            <span className="h-2 w-12 rounded bg-muted-foreground/20" />
                          ) : (
                            <>
                              <p
                                className="max-w-full truncate font-semibold"
                                style={{
                                  fontSize:
                                    tile.width >= 140 && tile.height >= 90
                                      ? 16
                                      : 12,
                                  lineHeight: 1.25,
                                  transition: "none",
                                }}
                              >
                                {entry.node.name}
                              </p>
                              {metrics && tile.height >= 46 && (
                                <p
                                  className="mt-1 max-w-full truncate text-xs tabular-nums"
                                  style={{ transition: "none" }}
                                >
                                  {metrics}
                                </p>
                              )}
                              {tile.group && drillDown && tile.height >= 70 && (
                                <p
                                  className="mt-2 text-[10px]"
                                  style={{ transition: "none" }}
                                >
                                  Explore group ↗︎
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </foreignObject>
                  )}
                  {ready && (
                    <rect
                      ref={(node) => {
                        refs.current[index] = node;
                      }}
                      data-tree-target={entry.key}
                      x={tile.x}
                      y={tile.y}
                      width={tile.width}
                      height={tile.expanded ? tile.headerHeight : tile.height}
                      rx={radius}
                      fill="transparent"
                      stroke={
                        inspection === entry.key || focus === entry.key
                          ? tile.expanded
                            ? "currentColor"
                            : ink
                          : "transparent"
                      }
                      strokeWidth={1.5}
                      className={cn(
                        "text-foreground",
                        "outline-none touch-manipulation",
                        onClick || (drillDown && tile.group)
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                      role={
                        onClick || (drillDown && tile.group)
                          ? "button"
                          : "graphics-symbol"
                      }
                      tabIndex={
                        index === Math.min(tab, tiles.length - 1) ? 0 : -1
                      }
                      aria-label={`${entry.path.join(" / ")}: ${valueFormatter(entry.value)}; ${rate(entry.percentage)} of total${tile.group && drillDown ? "; open group" : ""}`}
                      aria-describedby={
                        inspection === entry.key ? `${id}-tooltip` : undefined
                      }
                      onMouseEnter={() => setInspection(entry.key)}
                      onPointerDown={() => setInspection(entry.key)}
                      onFocus={() => {
                        setTab(index);
                        setFocus(entry.key);
                        setInspection(entry.key);
                      }}
                      onClick={(event) => select(entry, event.detail === 0)}
                      onKeyDown={(event) => navigate(event, index)}
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      )}
      {!chartError && data.length > 0 && (
        <div className="flex h-8 items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate">
            {loading
              ? ""
              : `${valueFormatter(scopeTotal)} total${viewEntry ? " in this group" : ""}`}
          </span>
          <button
            ref={tableButton}
            type="button"
            disabled={loading}
            className="shrink-0 rounded px-2 py-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onFocus={() => {
              setFocus(null);
              setInspection(null);
            }}
            aria-expanded={tableOpen}
            aria-controls={`${id}-data`}
            onClick={() => setTableOpen((open) => !open)}
          >
            {tableOpen ? "Hide data" : "View data"}
          </button>
        </div>
      )}
      {tableOpen && !loading && !chartError && (
        <div
          id={`${id}-data`}
          className="absolute inset-x-0 bottom-8 z-20 max-h-[75%] overflow-auto rounded-md border bg-popover p-3 shadow-lg"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setTableOpen(false);
              setInspection(null);
              tableButton.current?.focus();
            }
          }}
        >
          <table className="w-full text-left text-xs">
            <caption className="mb-3 text-left font-medium">
              {ariaLabel} source data · groups include their children
            </caption>
            <thead>
              <tr className="text-muted-foreground">
                <th className="pb-2">Path</th>
                <th className="pb-2 text-right">Value</th>
                <th className="pb-2 text-right">Of total</th>
              </tr>
            </thead>
            <tbody>
              {descendants.map((entry) => (
                <tr key={entry.key} className="border-t">
                  <th scope="row" className="py-2 pr-3 font-normal">
                    <button
                      type="button"
                      className="text-left underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onFocus={() => {
                        setFocus(entry.key);
                        setInspection(entry.key);
                      }}
                      onClick={(event) => select(entry, event.detail === 0)}
                    >
                      {entry.path.join(" / ")}
                    </button>
                  </th>
                  <td className="text-right tabular-nums">
                    {valueFormatter(entry.value)}
                  </td>
                  <td className="pl-3 text-right tabular-nums">
                    {rate(entry.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tip && (
        <InspectionTooltip
          id={`${id}-tooltip`}
          x={activeTile ? activeTile.x + activeTile.width / 2 : width / 2}
          y={
            top +
            (activeTile
              ? activeTile.y +
                (activeTile.expanded
                  ? activeTile.headerHeight
                  : activeTile.height) /
                  2
              : plotHeight / 2)
          }
          width={width}
          height={frameHeight}
        >
          {tooltipRenderer ? (
            tooltipRenderer(tip)
          ) : (
            <>
              <p className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                {tip.path.join(" › ")}
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {tip.formattedValue}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {rate(tip.percentage)} of total
              </p>
              {tip.depth > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {rate(tip.parentPercentage)} of parent
                </p>
              )}
              {viewEntry && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {rate(tip.viewPercentage)} of current view
                </p>
              )}
              {active?.children.length && drillDown ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Select to explore group
                </p>
              ) : null}
            </>
          )}
        </InspectionTooltip>
      )}
    </div>
  );
}
export const TreeMapChart = memo(TreeMapChartComponent);
