# Plano Completo: Implementação do Stacked Bar Chart

## 📋 Visão Geral

Este documento detalha todos os passos necessários para implementar o componente `StackedBarChart` no Mario Charts, desde a criação do componente até sua documentação completa.

---

## 🎯 Objetivos

- Criar componente StackedBarChart reutilizável e performático
- Suportar orientações vertical e horizontal
- Suportar variantes filled e outline
- Documentação completa com exemplos interativos
- Seguir padrões estabelecidos (BarChart, LineChart)

---

## 📁 Estrutura de Arquivos

### Arquivos a Criar

```
mariocharts/
├── src/components/charts/stacked-bar-chart/
│   └── index.tsx                          # Componente principal
└── app/docs/components/stacked-bar-chart/
    └── page.tsx                           # Página de documentação
```

---

## 🔧 1. Componente Principal

### Localização
`/src/components/charts/stacked-bar-chart/index.tsx`

### Interface TypeScript

```typescript
"use client";

import * as React from "react";
import { memo, useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../../lib/utils";

// Types
type ChartDataItem = Record<string, unknown>;

interface StackedBarChartProps<T extends ChartDataItem> {
  readonly data: readonly T[];              // Array de dados
  readonly x: keyof T;                      // Chave para categorias (ex: "quarter")
  readonly y: readonly (keyof T)[];         // Chaves para empilhamento (ex: ["sales", "marketing", "support"])
  readonly colors?: readonly string[];      // Cores para cada stack
  readonly className?: string;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly animation?: boolean;
  readonly variant?: 'filled' | 'outline';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly showLegend?: boolean;            // Mostrar legenda
  readonly onSegmentClick?: (data: T, stackKey: string, index: number) => void;
}
```

### Estrutura de Dados Esperada

```typescript
// Exemplo 1: Vendas por trimestre
const data = [
  { quarter: "Q1", sales: 100, marketing: 50, support: 30 },
  { quarter: "Q2", sales: 120, marketing: 60, support: 40 },
  { quarter: "Q3", sales: 90, marketing: 45, support: 35 },
  { quarter: "Q4", sales: 150, marketing: 80, support: 50 }
];

// Uso:
<StackedBarChart
  data={data}
  x="quarter"
  y={["sales", "marketing", "support"]}
/>
```

### Constantes

```typescript
const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
] as const;

const DEFAULT_HEIGHT = 300;
const MARGIN = { top: 10, right: 15, bottom: 25, left: 25 };
```

### Utilitários (Reutilizar do BarChart)

```typescript
function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
  return String(value);
}

function getNumericValue(data: ChartDataItem, key: keyof ChartDataItem): number {
  const value = data[key];
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$%\s]/g, ''));
    return isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function useContainerDimensions() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return [ref, width] as const;
}
```

### Lógica de Processamento de Dados

```typescript
const processedBars = useMemo(() => {
  if (!data.length || chartWidth <= 0 || chartHeight <= 0) return [];

  const isVertical = orientation === 'vertical';
  const barCount = data.length;

  // Calcular dimensões das barras
  const barSize = isVertical ? chartWidth / barCount : chartHeight / barCount;
  const barSpacing = barSize * 0.2;
  const actualBarSize = barSize * 0.8;

  // Para cada barra, calcular os segmentos empilhados
  return data.map((item, barIndex) => {
    // 1. Extrair valores de todas as y-keys
    const stackValues = y.map(key => getNumericValue(item, key as string));

    // 2. Calcular total da barra
    const totalValue = stackValues.reduce((sum, val) => sum + val, 0);

    // 3. Calcular posições acumulativas
    let cumulativeValue = 0;
    const segments = y.map((key, stackIndex) => {
      const value = stackValues[stackIndex] || 0;
      const startValue = cumulativeValue;
      cumulativeValue += value;

      if (isVertical) {
        // Vertical: empilhar de baixo para cima
        const segmentHeight = (value / totalValue) * chartHeight;
        const segmentY = chartHeight - (cumulativeValue / totalValue) * chartHeight;

        return {
          key: String(key),
          value,
          formattedValue: formatValue(value),
          x: barIndex * barSize + barSpacing / 2,
          y: segmentY,
          width: actualBarSize,
          height: segmentHeight,
          color: colors[stackIndex % colors.length] || DEFAULT_COLORS[0],
          stackIndex,
        };
      } else {
        // Horizontal: empilhar da esquerda para direita
        const segmentWidth = (value / totalValue) * chartWidth;
        const segmentX = (startValue / totalValue) * chartWidth;

        return {
          key: String(key),
          value,
          formattedValue: formatValue(value),
          x: segmentX,
          y: barIndex * barSize + barSpacing / 2,
          width: segmentWidth,
          height: actualBarSize,
          color: colors[stackIndex % colors.length] || DEFAULT_COLORS[0],
          stackIndex,
        };
      }
    });

    return {
      data: item,
      barIndex,
      label: String(item[x]),
      segments,
      totalValue,
      formattedTotal: formatValue(totalValue),
    };
  });
}, [data, x, y, colors, chartWidth, chartHeight, orientation]);
```

### Estados de Loading/Error/Empty

```typescript
function LoadingState({
  orientation = 'vertical',
  variant = 'filled',
  height = DEFAULT_HEIGHT
}: {
  orientation?: 'vertical' | 'horizontal';
  variant?: 'filled' | 'outline';
  height?: number;
}) {
  const isVertical = orientation === 'vertical';

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-full max-w-full">
          <div className="animate-pulse bg-muted rounded h-4 w-32 mb-4" />

          <div
            className="relative border-l border-b border-muted/30"
            style={{
              height: height - MARGIN.top - MARGIN.bottom - 50,
              marginLeft: MARGIN.left,
              marginRight: MARGIN.right,
              marginBottom: MARGIN.bottom,
            }}
          >
            {/* Barras empilhadas skeleton */}
            <div className={`flex ${isVertical ? 'items-end space-x-2 h-full' : 'flex-col justify-center space-y-2 w-full'}`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${isVertical ? 'flex-col' : 'flex-row'}`}
                  style={isVertical ? { width: 40 } : { height: 40 }}
                >
                  {/* Segmentos empilhados */}
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-muted rounded-sm animate-pulse"
                      style={isVertical
                        ? { height: 30 + (j * 10), width: '100%' }
                        : { width: 40 + (j * 15), height: '100%' }
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-destructive font-medium">Chart Error</div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-2">
        <div className="text-muted-foreground">No Data</div>
        <div className="text-sm text-muted-foreground">
          There&apos;s no data to display
        </div>
      </div>
    </div>
  );
}
```

### Renderização SVG

```typescript
return (
  <div
    ref={containerRef}
    className={cn('relative w-full', className)}
    style={{ height }}
  >
    <svg width="100%" height={height} className="overflow-hidden">
      <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
        {/* Eixos */}
        {orientation === 'vertical' ? (
          <>
            {/* Eixo Y */}
            <line x1={0} y1={0} x2={0} y2={chartHeight}
                  stroke="currentColor" opacity={0.1} />

            {/* Eixo X - base */}
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight}
                  stroke="currentColor" opacity={0.3} strokeWidth={1.5} />
          </>
        ) : (
          <>
            {/* Eixo Y - lado esquerdo */}
            <line x1={0} y1={0} x2={0} y2={chartHeight}
                  stroke="currentColor" opacity={0.3} strokeWidth={1.5} />

            {/* Eixo X */}
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight}
                  stroke="currentColor" opacity={0.1} />
          </>
        )}

        {/* Renderizar barras empilhadas */}
        {processedBars.map((bar) => (
          <g key={bar.barIndex}>
            {/* Renderizar cada segmento da pilha */}
            {bar.segments.map((segment) => {
              const isFilled = variant === 'filled';
              const isVertical = orientation === 'vertical';

              const motionProps = animation ? {
                initial: isVertical ? { scaleY: 0 } : { scaleX: 0 },
                animate: isVertical ? { scaleY: 1 } : { scaleX: 1 },
                transition: {
                  duration: 0.6,
                  delay: bar.barIndex * 0.05 + segment.stackIndex * 0.02,
                  ease: [0.4, 0, 0.2, 1],
                },
                whileHover: { opacity: 0.8 }
              } : {};

              const transformOrigin = isVertical
                ? `${segment.x + segment.width/2}px ${segment.y + segment.height}px`
                : `${segment.x}px ${segment.y + segment.height/2}px`;

              return (
                <motion.rect
                  key={`${bar.barIndex}-${segment.stackIndex}`}
                  x={segment.x}
                  y={segment.y}
                  width={segment.width}
                  height={segment.height}
                  fill={isFilled ? segment.color : 'none'}
                  stroke={isFilled ? 'none' : segment.color}
                  strokeWidth={isFilled ? 0 : 2}
                  rx={2}
                  className="cursor-pointer"
                  style={{ transformOrigin }}
                  {...motionProps}
                  onMouseEnter={() => setHoveredBar(bar.barIndex)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onClick={() => onSegmentClick?.(bar.data, segment.key, bar.barIndex)}
                />
              );
            })}
          </g>
        ))}

        {/* Labels do eixo X/Y */}
        {processedBars.map((bar) => {
          const isVertical = orientation === 'vertical';

          return (
            <text
              key={`label-${bar.barIndex}`}
              x={isVertical ? bar.segments[0]?.x + (bar.segments[0]?.width || 0) / 2 : -8}
              y={isVertical ? chartHeight + 15 : bar.segments[0]?.y + (bar.segments[0]?.height || 0) / 2}
              textAnchor={isVertical ? "middle" : "end"}
              dominantBaseline={isVertical ? "auto" : "middle"}
              fontSize={11}
              className="fill-muted-foreground"
            >
              {bar.label}
            </text>
          );
        })}
      </g>
    </svg>

    {/* Tooltip */}
    {hoveredBar !== null && processedBars[hoveredBar] && (() => {
      const bar = processedBars[hoveredBar];
      const isVertical = orientation === 'vertical';

      const tooltipStyle = isVertical ? {
        left: bar.segments[0]?.x + (bar.segments[0]?.width || 0) / 2 + MARGIN.left,
        top: Math.max(10, MARGIN.top - 10),
      } : {
        left: chartWidth + MARGIN.left + 10,
        top: bar.segments[0]?.y + (bar.segments[0]?.height || 0) / 2 + MARGIN.top,
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className={`absolute pointer-events-none z-50 bg-background border rounded-lg px-3 py-2 shadow-xl ${
            isVertical ? 'transform -translate-x-1/2' : 'transform -translate-y-1/2'
          }`}
          style={tooltipStyle}
        >
          <div className="text-xs font-medium mb-2">{bar.label}</div>

          {/* Mostrar cada segmento */}
          {bar.segments.map((segment) => (
            <div key={segment.key} className="flex items-center space-x-2 text-sm mb-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground">{segment.key}:</span>
              <span className="font-medium">{segment.formattedValue}</span>
            </div>
          ))}

          {/* Total */}
          <div className="border-t mt-1 pt-1 text-sm font-bold">
            Total: {bar.formattedTotal}
          </div>
        </motion.div>
      );
    })()}
  </div>
);
```

### Animações

```typescript
// Animação dos segmentos empilhados
const motionProps = animation ? {
  initial: isVertical ? { scaleY: 0 } : { scaleX: 0 },
  animate: isVertical ? { scaleY: 1 } : { scaleX: 1 },
  transition: {
    duration: 0.6,
    delay: bar.barIndex * 0.05 + segment.stackIndex * 0.02, // Stagger por barra e segmento
    ease: [0.4, 0, 0.2, 1],
  },
  whileHover: { opacity: 0.8 }
} : {};
```

---

## 📄 2. Página de Documentação

### Localização
`/app/docs/components/stacked-bar-chart/page.tsx`

### Estrutura Completa

```typescript
"use client";

import { useState } from "react";
import { Breadcrumbs } from "../../../../components/site/breadcrumbs";
import { StackedBarChart } from "@/src/components/charts/stacked-bar-chart";
import { ExampleShowcase } from "../../../../components/ui/example-showcase";
import { APIReference } from "../../../../components/ui/api-reference";
import { InstallationGuide } from "../../../../components/ui/installation-guide";
import { Graph } from "@phosphor-icons/react";
import { StyledSelect } from "../../../../components/ui/styled-select";
import { AnimatedCheckbox } from "../../../../components/ui/animated-checkbox";

// Dados de exemplo
const quarterlyData = [
  { quarter: "Q1 2024", sales: 120, marketing: 45, support: 30, engineering: 85 },
  { quarter: "Q2 2024", sales: 150, marketing: 60, support: 40, engineering: 95 },
  { quarter: "Q3 2024", sales: 135, marketing: 50, support: 35, engineering: 90 },
  { quarter: "Q4 2024", sales: 180, marketing: 75, support: 50, engineering: 110 }
] as const;

const budgetData = [
  { category: "Infrastructure", hardware: 50000, software: 30000, cloud: 20000 },
  { category: "Personnel", hardware: 0, software: 10000, cloud: 80000 },
  { category: "Marketing", hardware: 5000, software: 15000, cloud: 25000 },
  { category: "Operations", hardware: 15000, software: 20000, cloud: 35000 }
] as const;

const monthlyExpenses = [
  { month: "Jan", rent: 5000, utilities: 1200, salaries: 15000, other: 2000 },
  { month: "Feb", rent: 5000, utilities: 1100, salaries: 15500, other: 1800 },
  { month: "Mar", rent: 5000, utilities: 1300, salaries: 16000, other: 2200 },
  { month: "Apr", rent: 5200, utilities: 1250, salaries: 16500, other: 2100 },
  { month: "May", rent: 5200, utilities: 1400, salaries: 17000, other: 2300 },
  { month: "Jun", rent: 5200, utilities: 1350, salaries: 17500, other: 2400 }
] as const;

// API Reference
const stackedBarChartProps = [
  {
    name: "data",
    type: "readonly T[]",
    description: "Array of data objects to display in the chart",
    required: true
  },
  {
    name: "x",
    type: "keyof T",
    description: "Key from data object to use for x-axis labels (categories)",
    required: true
  },
  {
    name: "y",
    type: "readonly (keyof T)[]",
    description: "Array of keys from data object to stack (e.g., ['sales', 'marketing', 'support'])",
    required: true
  },
  {
    name: "colors",
    type: "readonly string[]",
    default: "DEFAULT_COLORS",
    description: "Array of colors to use for each stack segment"
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description: "Visual style of bars - filled with color or outline only"
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: "Direction of bar growth - vertical (bottom-up) or horizontal (left-right)"
  },
  {
    name: "height",
    type: "number",
    default: "300",
    description: "Height of the chart in pixels"
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Show loading state with skeleton"
  },
  {
    name: "error",
    type: "string | null",
    default: "null",
    description: "Error message to display"
  },
  {
    name: "animation",
    type: "boolean",
    default: "true",
    description: "Enable entrance animations"
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Display legend showing stack categories"
  },
  {
    name: "onSegmentClick",
    type: "(data: T, stackKey: string, index: number) => void",
    description: "Callback fired when a segment is clicked"
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes to apply to the container"
  }
];

// Installation steps
const installationSteps = [
  {
    title: "Initialize Mario Charts (first time only)",
    description: "Set up Mario Charts in your React project. This configures paths and dependencies.",
    code: `# Initialize the project (run once)
npx mario-charts@latest init

# Or initialize with components
npx mario-charts@latest init --components stacked-bar-chart`,
    language: "bash"
  },
  {
    title: "Add the StackedBarChart component",
    description: "Install the StackedBarChart component using the CLI. This automatically handles dependencies.",
    code: `# Add StackedBarChart component
npx mario-charts@latest add stacked-bar-chart

# Add multiple components at once
npx mario-charts@latest add stacked-bar-chart bar-chart line-chart`,
    language: "bash"
  },
  {
    title: "Start using the component",
    description: "Import and use the StackedBarChart in your React components.",
    code: `import { StackedBarChart } from "@/components/charts/stacked-bar-chart";

// Use in your component
<StackedBarChart
  data={data}
  x="quarter"
  y={["sales", "marketing", "support"]}
/>`,
    language: "tsx"
  }
];

export default function StackedBarChartPage() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [chartKey, setChartKey] = useState(0);
  const [variant, setVariant] = useState<'filled' | 'outline'>('filled');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  const replayAnimation = () => {
    setChartKey(prev => prev + 1);
  };

  return (
    <div className="max-w-none space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="flex flex-col space-y-4 pb-8 pt-6">
        <div className="flex items-center space-x-3">
          <Graph size={24} weight="duotone" className="text-primary" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Stacked Bar Chart
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
          A powerful stacked bar chart for comparing part-to-whole relationships across categories.
          Perfect for budget breakdowns, resource allocation, and comparative analysis with multiple data series.
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Multiple Series Stacking
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Vertical & Horizontal
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Filled & Outline Variants
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Interactive Tooltips
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            Segment Click Events
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foreground rounded-full"></div>
            TypeScript Support
          </div>
        </div>
      </div>

      {/* Quick Start Example */}
      <ExampleShowcase
        title="Basic Example"
        description="Quarterly performance breakdown showing sales, marketing, support, and engineering expenses"
        preview={
          <div className="space-y-4">
            <div className="h-80">
              <StackedBarChart
                key={chartKey}
                data={quarterlyData}
                x="quarter"
                y={["sales", "marketing", "support", "engineering"]}
                variant={variant}
                orientation={orientation}
                onSegmentClick={(data, stackKey, index) => {
                  setSelectedSegment(`${stackKey} - Q${index + 1}`);
                  console.log('Clicked:', data, stackKey, index);
                }}
                animation={showAnimation}
              />
            </div>

            {/* Interactive feedback */}
            <div className="p-3 bg-muted/50 rounded-lg border text-sm">
              <div className="font-medium">
                Selected: {selectedSegment || 'Click a segment to select'}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <AnimatedCheckbox
                    checked={showAnimation}
                    onChange={setShowAnimation}
                    label="Animations"
                    id="basic-animations"
                  />

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Variant:</span>
                    <StyledSelect
                      value={variant}
                      onValueChange={(value) => setVariant(value as 'filled' | 'outline')}
                      options={[
                        { value: 'filled', label: 'Filled' },
                        { value: 'outline', label: 'Outline' }
                      ]}
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <span>Orientation:</span>
                    <StyledSelect
                      value={orientation}
                      onValueChange={(value) => setOrientation(value as 'vertical' | 'horizontal')}
                      options={[
                        { value: 'vertical', label: 'Vertical' },
                        { value: 'horizontal', label: 'Horizontal' }
                      ]}
                    />
                  </div>
                </div>

                <button
                  onClick={replayAnimation}
                  disabled={!showAnimation}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replay Animation
                </button>
              </div>
            </div>
          </div>
        }
        code={`import { StackedBarChart } from '@/components/charts/stacked-bar-chart';

const quarterlyData = [
  { quarter: "Q1 2024", sales: 120, marketing: 45, support: 30, engineering: 85 },
  { quarter: "Q2 2024", sales: 150, marketing: 60, support: 40, engineering: 95 },
  { quarter: "Q3 2024", sales: 135, marketing: 50, support: 35, engineering: 90 },
  { quarter: "Q4 2024", sales: 180, marketing: 75, support: 50, engineering: 110 }
];

export function QuarterlyChart() {
  return (
    <StackedBarChart
      data={quarterlyData}
      x="quarter"
      y={["sales", "marketing", "support", "engineering"]}
      onSegmentClick={(data, stackKey, index) => {
        console.log('Clicked:', data, stackKey, index);
      }}
    />
  );
}`}
      />

      {/* Installation */}
      <InstallationGuide
        title="Installation"
        description="Get started with the StackedBarChart component in just a few steps."
        cliCommand="npx mario-charts@latest add stacked-bar-chart"
        steps={installationSteps}
      />

      {/* More Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Examples</h2>
          <p className="text-muted-foreground">
            Explore different use cases for the StackedBarChart component.
          </p>
        </div>

        {/* Budget Breakdown */}
        <ExampleShowcase
          title="Budget Breakdown"
          description="IT budget allocation across departments showing hardware, software, and cloud costs"
          preview={
            <div className="h-80">
              <StackedBarChart
                data={budgetData}
                x="category"
                y={["hardware", "software", "cloud"]}
                colors={['#3b82f6', '#10b981', '#f59e0b']}
              />
            </div>
          }
          code={`const budgetData = [
  { category: "Infrastructure", hardware: 50000, software: 30000, cloud: 20000 },
  { category: "Personnel", hardware: 0, software: 10000, cloud: 80000 },
  { category: "Marketing", hardware: 5000, software: 15000, cloud: 25000 },
  { category: "Operations", hardware: 15000, software: 20000, cloud: 35000 }
];

<StackedBarChart
  data={budgetData}
  x="category"
  y={["hardware", "software", "cloud"]}
  colors={['#3b82f6', '#10b981', '#f59e0b']}
/>`}
        />

        {/* Monthly Expenses */}
        <ExampleShowcase
          title="Monthly Expenses"
          description="Track monthly expenses with horizontal orientation for better label readability"
          preview={
            <div className="h-96">
              <StackedBarChart
                data={monthlyExpenses}
                x="month"
                y={["rent", "utilities", "salaries", "other"]}
                orientation="horizontal"
                colors={['#ef4444', '#f59e0b', '#10b981', '#8b5cf6']}
              />
            </div>
          }
          code={`const monthlyExpenses = [
  { month: "Jan", rent: 5000, utilities: 1200, salaries: 15000, other: 2000 },
  { month: "Feb", rent: 5000, utilities: 1100, salaries: 15500, other: 1800 },
  // ... more months
];

<StackedBarChart
  data={monthlyExpenses}
  x="month"
  y={["rent", "utilities", "salaries", "other"]}
  orientation="horizontal"
  colors={['#ef4444', '#f59e0b', '#10b981', '#8b5cf6']}
/>`}
        />
      </div>

      {/* API Reference */}
      <APIReference
        title="API Reference"
        description="Complete TypeScript interface with all available props and configurations."
        props={stackedBarChartProps}
      />
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Fase 0: Preparação e Alinhamento
- [x] Revisar `agents/bar-chart-architect.md` para garantir aderência às diretrizes de arquitetura de charts
- [x] Mapear utilitários existentes no `BarChart` e `LineChart` e definir quais serão reutilizados ou extraídos
- [x] Validar dependências necessárias (`recharts`, `framer-motion`, `@radix-ui/react-tooltip`) no `package.json` e peers da CLI
- [x] Definir paleta inicial com base em `src/themes/colors.ts` e tokens do design system para evitar duplicidade de cores
- [x] Atualizar os datasets de exemplo garantindo contraste, rótulos compreensíveis e ausência de dados sensíveis
- [x] Documentar riscos conhecidos (valores negativos, totais zerados, overflow de labels) antes de iniciar a implementação

### Fase 1: Componente Base
- [x] Criar arquivo `/src/components/charts/stacked-bar-chart/index.tsx`
- [x] Implementar interface TypeScript `StackedBarChartProps`
- [x] Implementar função `getNumericValue` (reutilizar)
- [x] Implementar função `formatValue` (reutilizar)
- [x] Implementar hook `useContainerDimensions` (reutilizar)
- [x] Implementar constantes `DEFAULT_COLORS`, `DEFAULT_HEIGHT`, `MARGIN`

### Fase 2: Lógica de Processamento
- [x] Implementar `processedBars` com lógica de empilhamento
- [x] Calcular valores cumulativos corretamente
- [x] Suportar orientação vertical (bottom-up stacking)
- [x] Suportar orientação horizontal (left-right stacking)
- [x] Normalizar alturas/larguras baseado no total
- [x] Garantir suporte a valores negativos definindo baseline e acumuladores independentes por direção
- [x] Definir fallback seguro para totais igual a zero evitando divisões por zero e sinalizando estado neutro

### Fase 3: Estados
- [x] Implementar `LoadingState` com skeleton de barras empilhadas
- [x] Implementar `ErrorState`
- [x] Implementar `EmptyState`
- [x] Adicionar verificações de dados vazios/inválidos

### Fase 4: Renderização SVG
- [x] Renderizar eixos X e Y baseado em orientação
- [x] Renderizar segmentos empilhados com `motion.rect`
- [x] Implementar variantes filled e outline
- [x] Adicionar labels para categorias
- [x] Garantir transformOrigin correto para animações

### Fase 5: Interatividade
- [x] Implementar hover state (destaque de barra completa)
- [x] Implementar tooltip mostrando todos os segmentos
- [x] Implementar `onSegmentClick` handler
- [x] Adicionar cursor pointer nos segmentos
- [x] Garantir navegação por teclado com `tabIndex`, `role="img"`/`aria-label` e foco visível nos segmentos

### Fase 6: Animações
- [x] Animação de entrada staggered (por barra e segmento)
- [x] Usar scaleY para vertical, scaleX para horizontal
- [x] Implementar whileHover para feedback visual
- [x] Respeitar prop `animation`
- [x] Respeitar `prefers-reduced-motion`, usando fallback de animação zero quando necessário

### Fase 7: Documentação
- [ ] Criar `/app/docs/components/stacked-bar-chart/page.tsx`
- [ ] Adicionar hero section com descrição
- [ ] Criar exemplo básico (quarterly data)
- [ ] Criar exemplo de budget breakdown
- [ ] Criar exemplo de monthly expenses
- [ ] Adicionar controles interativos (variant, orientation, animations)
- [ ] Implementar InstallationGuide
- [ ] Implementar APIReference
- [ ] Adicionar states demo (loading, error, empty)
- [ ] Registrar a página na navegação/índice de docs caso necessário
- [ ] Criar story em `/src/components/charts/stacked-bar-chart/StackedBarChart.stories.tsx` alinhado aos exemplos

### Fase 8: Testes & Validação
- [ ] Testar com dados vazios
- [ ] Testar com valores negativos
- [ ] Testar com muitas categorias (>20)
- [ ] Testar com muitos stacks (>6)
- [ ] Validar responsividade (mobile, tablet, desktop)
- [ ] Validar animações em diferentes navegadores
- [ ] Validar tooltips não saem da tela
- [ ] Validar cores contrastantes (WCAG AA)
- [ ] Criar `StackedBarChart.test.tsx` com `@testing-library/react` cobrindo variantes, orientação e estados
- [ ] Executar testes de acessibilidade automatizados (ex: `axe-core`) nos cenários principais

### Fase 9: Polimento
- [x] Revisar código para patterns consistentes
- [x] Adicionar comentários em lógica complexa
- [x] Garantir exports corretos (`StackedBarChart`, `StackedBarChartProps`, etc.)
- [x] Validar TypeScript strict mode
- [ ] Code review final
- [ ] Atualizar `components.json`, `mario-charts.json` (se aplicável) e exports centrais para disponibilizar o componente

### Fase 10: Distribuição e DX
- [ ] Criar registro em `packages/registry/registry/charts/stacked-bar-chart.json` com metadados, dependências e arquivos
- [ ] Ajustar templates da CLI (se necessário) e testar via `npm run dev:cli` para validar scaffolding
- [ ] Rodar `npm run lint`, `npm run typecheck` e `npm run test` garantindo ausência de regressões antes do PR
- [ ] Adicionar changelog/resumo no PR destacando breaking changes ou novos requisitos
- [ ] Capturar screenshots ou gravações das demos para anexar à documentação e PR
---

## 🎨 Casos de Uso

### 1. **Quarterly Performance**
```typescript
const data = [
  { quarter: "Q1", sales: 100, marketing: 50, support: 30 },
  { quarter: "Q2", sales: 120, marketing: 60, support: 40 },
];

<StackedBarChart data={data} x="quarter" y={["sales", "marketing", "support"]} />
```

### 2. **Budget Allocation**
```typescript
const budget = [
  { dept: "Engineering", salaries: 500000, tools: 100000, training: 50000 },
  { dept: "Marketing", salaries: 300000, tools: 80000, training: 30000 },
];

<StackedBarChart
  data={budget}
  x="dept"
  y={["salaries", "tools", "training"]}
  orientation="horizontal"
/>
```

### 3. **Resource Distribution**
```typescript
const resources = [
  { project: "App A", backend: 5, frontend: 3, devops: 2 },
  { project: "App B", backend: 3, frontend: 4, devops: 1 },
];

<StackedBarChart
  data={resources}
  x="project"
  y={["backend", "frontend", "devops"]}
  variant="outline"
/>
```

---

## 🚀 Próximos Passos

Após aprovação deste plano:

1. **Implementar componente principal** seguindo a estrutura definida
2. **Testar lógica de empilhamento** com diferentes datasets
3. **Criar página de documentação** com exemplos interativos
4. **Validar responsividade e acessibilidade**
5. **Fazer code review** e ajustes finais
6. **Preparar PR** com título descritivo e descrição detalhada

---

## 📝 Notas Técnicas

### Cálculo de Posições Acumulativas

**Vertical (bottom-up):**
```
Segmento 1: y = chartHeight - (cumulative / total) * chartHeight
Segmento 2: y = chartHeight - (cumulative / total) * chartHeight
...
```

**Horizontal (left-right):**
```
Segmento 1: x = (startValue / total) * chartWidth
Segmento 2: x = (startValue / total) * chartWidth
...
```

### Performance
- Usar `useMemo` para `processedBars` (evita recálculos)
- Evitar re-renders desnecessários com `memo`
- Otimizar SVG com `transform` ao invés de `x`/`y` dinâmicos

### Acessibilidade
- Tooltips descrevem valores de todos os segmentos
- Cores com contraste adequado (WCAG AA)
- Labels sempre visíveis
- Suporte a teclado (futuro)

---

**Última atualização:** 2025-10-11
