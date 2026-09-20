"use client";
import {
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
  useId,
  type KeyboardEvent,
} from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { formatValue, useContainerDimensions } from "../_shared";
import { InspectionTooltip } from "../_shared/inspection-tooltip";
import { buildSankey, connectedFlow, SANKEY_COLORS } from "./model";
import { layoutSankey } from "./geometry";
import type {
  SankeyNode,
  SankeyLink,
  SankeyInspection,
  SankeyChartProps,
} from "./types";
export type {
  SankeyNode,
  SankeyLink,
  SankeyInspection,
  SankeyChartProps,
} from "./types";
const placeholderNodes = [
  { id: "start", label: "Entry" },
  { id: "a", label: "Path A" },
  { id: "b", label: "Path B" },
  { id: "end", label: "Complete" },
];
const placeholderLinks = [
  { source: "start", target: "a", value: 60 },
  { source: "start", target: "b", value: 40 },
  { source: "a", target: "end", value: 60 },
  { source: "b", target: "end", value: 40 },
];
const percentage = (value: number, total: number) =>
  total ? (value / total) * 100 : null;
const percent = (n: number | null) => (n === null ? "—" : `${n.toFixed(1)}%`);
function SankeyChartComponent<N extends SankeyNode, L extends SankeyLink>({
  nodes,
  links,
  colors = SANKEY_COLORS,
  align = "justify",
  linkColor = "gradient",
  curvature = 0.5,
  nodeWidth = 18,
  nodeGap = 24,
  showValues = true,
  className,
  height = 400,
  loading = false,
  error = null,
  animation = true,
  valueFormatter = formatValue,
  ariaLabel = "Sankey chart",
  description,
  onNodeClick,
  onLinkClick,
  tooltipRenderer,
}: SankeyChartProps<N, L>) {
  const [rootRef, width] = useContainerDimensions();
  const id = useId();
  const reduced = useReducedMotion();
  const model = useMemo(
    () => buildSankey(nodes, links, colors),
    [nodes, links, colors],
  );
  const placeholder = useMemo(
    () => buildSankey(placeholderNodes, placeholderLinks),
    [],
  );
  const source =
    loading && (!nodes.length || model.error) ? placeholder : model;
  const validHeight = Number.isFinite(height) && height > 0;
  const validWidth =
    Number.isFinite(nodeWidth) && nodeWidth >= 1 && nodeWidth <= 80;
  const validGap = Number.isFinite(nodeGap) && nodeGap >= 0 && nodeGap <= 200;
  const validCurve =
    Number.isFinite(curvature) && curvature >= 0 && curvature <= 1;
  const validAlign = align === "justify" || align === "start";
  const validColor = ["gradient", "source", "target"].includes(linkColor);
  const chartError =
    error ||
    model.error ||
    (!validHeight
      ? "height must be a positive finite number."
      : !validWidth
        ? "nodeWidth must be between 1 and 80 pixels."
        : !validGap
          ? "nodeGap must be between 0 and 200 pixels."
          : !validCurve
            ? "curvature must be between 0 and 1."
            : !validAlign
              ? "align must be justify or start."
              : !validColor
                ? "linkColor must be gradient, source or target."
                : null);
  const frameHeight = validHeight ? height : 400;
  const geometry = useMemo(
    () =>
      layoutSankey(
        source,
        width,
        frameHeight,
        validWidth ? nodeWidth : 18,
        validGap ? nodeGap : 24,
        validCurve ? curvature : 0.5,
        validAlign ? align : "justify",
      ),
    [
      source,
      width,
      frameHeight,
      nodeWidth,
      nodeGap,
      curvature,
      align,
      validWidth,
      validGap,
      validCurve,
      validAlign,
    ],
  );
  const ready = !loading && !chartError && nodes.length > 0 && width > 0;
  const progress = useMotionValue(1);
  const clip = useRef<SVGRectElement>(null);
  useEffect(() => {
    const update = (p: number) =>
      clip.current?.setAttribute("width", String(p * geometry.width));
    update(progress.get());
    return progress.on("change", update);
  }, [progress, geometry.width, ready, loading]);
  useEffect(() => {
    if (!ready || !animation || reduced) {
      progress.jump(1);
      return;
    }
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: 0.85,
      ease: [0.33, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [ready, animation, reduced, progress]);
  const viewport = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [inspection, setInspection] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const refs = useRef<(SVGElement | null)[]>([]);
  const count = nodes.length + links.length;
  const selected = Math.min(tab, Math.max(0, count - 1));
  useEffect(() => {
    const focused = refs.current.findIndex(
      (element) => element !== null && element === document.activeElement,
    );
    setInspection(focused < 0 ? null : focused);
    setFocus(focused < 0 ? null : focused);
    if (focused >= 0) progress.jump(1);
  }, [nodes, links, loading, error, progress]);
  const active = ready ? inspection : null;
  const activeKind =
    active !== null && active >= nodes.length ? "link" : "node";
  const activeIndex =
    active === null
      ? -1
      : activeKind === "link"
        ? active - nodes.length
        : active;
  const highlighted = useMemo(
    () =>
      active !== null ? connectedFlow(model, activeKind, activeIndex) : null,
    [model, active, activeKind, activeIndex],
  );
  let tip: SankeyInspection<N, L> | null = null;
  let anchor = { x: 0, y: 0 };
  if (active !== null) {
    if (activeKind === "node") {
      const node = model.nodes[activeIndex],
        g = geometry.nodes[activeIndex];
      if (node && g) {
        tip = {
          kind: "node",
          data: node.data,
          index: activeIndex,
          value: node.value,
          incoming: node.incoming,
          outgoing: node.outgoing,
          color: node.color,
        };
        anchor = { x: g.x + g.width / 2, y: g.y + g.height / 2 };
      }
    } else {
      const edge = model.links[activeIndex],
        g = geometry.links[activeIndex];
      if (edge && g) {
        const start = model.nodes[edge.source]!,
          end = model.nodes[edge.target]!;
        tip = {
          kind: "link",
          data: edge.data,
          index: activeIndex,
          source: start.data,
          target: end.data,
          value: edge.value,
          sourcePercentage: percentage(edge.value, start.outgoing),
          targetPercentage: percentage(edge.value, end.incoming),
          color: start.color,
        };
        anchor = { x: g.x, y: g.y };
      }
    }
  }
  const tipX = anchor.x - scroll.x,
    tipY = anchor.y - scroll.y;
  function activate(index: number) {
    setInspection(index);
    if (index < nodes.length) onNodeClick?.(nodes[index]!, index);
    else onLinkClick?.(links[index - nodes.length]!, index - nodes.length);
  }
  function navigate(event: KeyboardEvent<SVGElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      setInspection(null);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(index);
      return;
    }
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else if (["ArrowRight", "ArrowDown"].includes(event.key))
      next = (index + 1) % count;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key))
      next = (index - 1 + count) % count;
    else return;
    event.preventDefault();
    setTab(next);
    refs.current[next]?.focus();
  }
  const interactions = (index: number) => ({
    tabIndex: index === selected ? 0 : -1,
    onMouseEnter: () => setInspection(index),
    onPointerDown: () => setInspection(index),
    onFocus: () => {
      setTab(index);
      setFocus(index);
      setInspection(index);
    },
    onClick: () => activate(index),
    onKeyDown: (event: KeyboardEvent<SVGElement>) => navigate(event, index),
    "aria-describedby": active === index ? `${id}-tooltip` : undefined,
  });
  const message =
    !loading && chartError
      ? chartError
      : !loading && !nodes.length
        ? "No Data"
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
          setFocus(null);
          setInspection(null);
        }
      }}
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading flow
        </span>
      )}
      {message ? (
        <div
          role={chartError ? "alert" : "status"}
          className="flex h-full items-center justify-center p-6 text-center"
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
        <>
          <div
            ref={viewport}
            className="h-full overflow-auto"
            onScroll={(event) =>
              setScroll({
                x: event.currentTarget.scrollLeft,
                y: event.currentTarget.scrollTop,
              })
            }
          >
            <svg
              width={geometry.width}
              height={geometry.height}
              role={loading ? "presentation" : "group"}
              aria-hidden={loading || undefined}
              aria-label={ariaLabel}
              aria-describedby={`${id}-description`}
              onFocusCapture={() => progress.jump(1)}
            >
              <desc id={`${id}-description`}>
                {description ? `${description} ` : ""}Directed flow from left to
                right. Link thickness represents supplied volume. Node height
                represents the larger of incoming and outgoing totals; these
                totals do not imply unique users. Arrow keys inspect nodes then
                links in input order, Home/End jump, Escape dismisses,
                Enter/Space selects. Crowded graphs scroll.
              </desc>
              <defs>
                <clipPath id={`${id}-reveal`} clipPathUnits="userSpaceOnUse">
                  <rect
                    ref={clip}
                    width={geometry.width * progress.get()}
                    height={geometry.height}
                  />
                </clipPath>
                {source.links.map((edge, i) => {
                  const g = geometry.links[i]!;
                  return (
                    <linearGradient
                      key={i}
                      id={`${id}-link-${i}`}
                      gradientUnits="userSpaceOnUse"
                      x1={g.x0}
                      x2={g.x1}
                      y1={g.y0}
                      y2={g.y1}
                    >
                      <stop
                        offset="0%"
                        stopColor={source.nodes[edge.source]!.color}
                      />
                      <stop
                        offset="100%"
                        stopColor={source.nodes[edge.target]!.color}
                      />
                    </linearGradient>
                  );
                })}
              </defs>
              <g
                clipPath={`url(#${id}-reveal)`}
                className={cn(
                  loading && "text-muted",
                  loading &&
                    animation &&
                    !reduced &&
                    "animate-pulse motion-reduce:animate-none",
                )}
              >
                {source.links.map((edge, i) => (
                  <path
                    key={i}
                    data-sankey-link={loading ? undefined : i}
                    data-loading-link={loading ? i : undefined}
                    d={geometry.links[i]!.path}
                    aria-hidden="true"
                    fill={
                      loading
                        ? "currentColor"
                        : linkColor === "gradient"
                          ? `url(#${id}-link-${i})`
                          : source.nodes[
                              linkColor === "target" ? edge.target : edge.source
                            ]!.color
                    }
                    fillOpacity={
                      highlighted
                        ? highlighted.links.has(i)
                          ? 0.65
                          : 0.09
                        : 0.3
                    }
                  />
                ))}
                {source.nodes.map((node, i) => {
                  const g = geometry.nodes[i]!;
                  return (
                    <rect
                      key={i}
                      data-sankey-node={loading ? undefined : i}
                      data-loading-node={loading ? i : undefined}
                      x={g.x}
                      y={g.y}
                      width={g.width}
                      height={g.height}
                      rx={Math.min(3, g.height / 2)}
                      fill={loading ? "currentColor" : node.color}
                      fillOpacity={
                        highlighted && !highlighted.nodes.has(i) ? 0.25 : 1
                      }
                      aria-hidden="true"
                    />
                  );
                })}
              </g>
              {ready &&
                model.links.map((edge, i) => (
                  <path
                    key={i}
                    ref={(node) => {
                      refs.current[nodes.length + i] = node;
                    }}
                    data-sankey-link-target={i}
                    d={geometry.links[i]!.centerPath}
                    fill="none"
                    stroke={
                      focus === nodes.length + i
                        ? "currentColor"
                        : "transparent"
                    }
                    strokeWidth={Math.max(10, geometry.links[i]!.width)}
                    strokeOpacity={0}
                    className={cn(
                      "text-foreground",
                      "outline-none touch-manipulation",
                      onLinkClick ? "cursor-pointer" : "cursor-default",
                    )}
                    role={onLinkClick ? "button" : "graphics-symbol"}
                    aria-label={`${model.nodes[edge.source]!.label} to ${model.nodes[edge.target]!.label}: ${valueFormatter(edge.value)}; ${percent(percentage(edge.value, model.nodes[edge.source]!.outgoing))} of source outgoing`}
                    {...interactions(nodes.length + i)}
                  />
                ))}
              {ready &&
                focus !== null &&
                focus >= nodes.length &&
                geometry.links[focus - nodes.length] && (
                  <path
                    d={geometry.links[focus - nodes.length]!.centerPath}
                    fill="none"
                    strokeWidth={2}
                    pointerEvents="none"
                    aria-hidden="true"
                    className="stroke-foreground"
                  />
                )}
              {source.nodes.map((node, i) => {
                const g = geometry.nodes[i]!;
                return (
                  <g key={i}>
                    <foreignObject
                      x={g.labelX}
                      y={g.labelY}
                      width={g.labelWidth}
                      height={40}
                      aria-hidden="true"
                      pointerEvents="none"
                    >
                      <div
                        className={cn(
                          "w-fit max-w-full rounded-sm bg-background/95 px-1.5 py-0.5",
                          g.last && "ml-auto text-right",
                        )}
                        title={loading ? undefined : node.label}
                      >
                        {loading ? (
                          <span className="inline-block h-2 w-16 rounded bg-muted" />
                        ) : (
                          <>
                            <p className="truncate text-xs font-medium text-foreground">
                              {node.label}
                            </p>
                            {showValues && (
                              <p className="truncate text-[11px] tabular-nums text-muted-foreground">
                                {valueFormatter(node.value)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </foreignObject>
                    {ready && (active === i || focus === i) && (
                      <rect
                        x={g.x - 4}
                        y={g.y + g.height / 2 - Math.max(16, g.height + 8) / 2}
                        width={g.width + 8}
                        height={Math.max(16, g.height + 8)}
                        rx={4}
                        fill="none"
                        strokeWidth={1.5}
                        pointerEvents="none"
                        aria-hidden="true"
                        className="stroke-foreground"
                      />
                    )}
                    {ready && (
                      <path
                        ref={(element) => {
                          refs.current[i] = element;
                        }}
                        data-sankey-node-target={i}
                        d={`M ${g.x - Math.max(6, (44 - g.width) / 2)} ${g.y + g.height / 2 - Math.max(32, g.height + 8) / 2} h ${Math.max(44, g.width + 12)} v ${Math.max(32, g.height + 8)} h ${-Math.max(44, g.width + 12)} Z M ${g.labelX} ${g.labelY} h ${g.labelWidth} v 40 h ${-g.labelWidth} Z`}
                        fill="transparent"
                        className={cn(
                          "outline-none touch-manipulation",
                          onNodeClick ? "cursor-pointer" : "cursor-default",
                        )}
                        role={onNodeClick ? "button" : "graphics-symbol"}
                        aria-label={`${node.label}: ${valueFormatter(node.value)} volume; ${valueFormatter(node.incoming)} incoming; ${valueFormatter(node.outgoing)} outgoing`}
                        {...interactions(i)}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          {ready && (
            <table className="sr-only">
              <caption>{ariaLabel} source connections</caption>
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Target</th>
                  <th scope="col">Volume</th>
                </tr>
              </thead>
              <tbody>
                {model.links.map((edge) => (
                  <tr key={edge.index}>
                    <td>{model.nodes[edge.source]!.label}</td>
                    <td>{model.nodes[edge.target]!.label}</td>
                    <td>{valueFormatter(edge.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tip && (
            <InspectionTooltip
              id={`${id}-tooltip`}
              x={tipX}
              y={tipY}
              width={width}
              height={frameHeight}
            >
              {tooltipRenderer ? (
                tooltipRenderer(tip)
              ) : (
                <>
                  <p className="mb-2 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                    {tip.kind === "node"
                      ? tip.data.label
                      : `${tip.source.label} → ${tip.target.label}`}
                  </p>
                  <div className="flex items-center justify-between gap-6 text-sm font-semibold">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{ background: tip.color }}
                    />
                    <span>{valueFormatter(tip.value)}</span>
                  </div>
                  {tip.kind === "node" ? (
                    <>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {valueFormatter(tip.incoming)} incoming
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {valueFormatter(tip.outgoing)} outgoing
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {percent(tip.sourcePercentage)} of source outgoing
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {percent(tip.targetPercentage)} of target incoming
                      </p>
                    </>
                  )}
                </>
              )}
            </InspectionTooltip>
          )}
        </>
      )}
    </div>
  );
}
export const SankeyChart = memo(
  SankeyChartComponent,
) as typeof SankeyChartComponent;
