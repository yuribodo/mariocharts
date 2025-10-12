# Repository Guidelines

## Project Structure & Module Organization
- Next.js pages live in `app/`; marketing blocks are in `components/site` and shared widgets in `components/ui`.
- Published components stay in `src/components/**` with supporting hooks in `src/hooks` and shared utilities in `lib/`.
- CLI assets sit in `packages/cli`, registry metadata in `packages/registry`, and static files in `public/`; lean on the `@/...` aliases from `tsconfig.json`.

## DX & Design Principles
- Treat documentation as product: update `docs/`, snippets, and copy whenever APIs move.
- Keep onboarding frictionless—CLI templates must succeed on a clean workspace with all peers declared.
- Ship beautiful defaults that remain copy-paste friendly while revealing advanced switches only when needed.
- Guard “fail fast” behavior with actionable errors, strict TypeScript, and performance-conscious patterns.

## Build, Test, and Development Commands
- `npm run dev` boots the Turbopack site; `npm run dev:cli` watches template changes.
- `npm run build` runs the CLI build then the production Next.js build; use it as the release gate.
- `npm run lint` / `npm run lint:fix` apply the shared ESLint ruleset; pair with `npm run typecheck` before reviews.
- `npm run test` executes Jest suites, and `npm run storybook` opens Storybook for visual QA.

## Coding Style & Naming Conventions
- Prefer TypeScript functional components and React hooks for stateful logic.
- Follow Prettier/ESLint defaults (two spaces, double quotes) and let `lint:fix` resolve drift.
- Exported components and files use `PascalCase`, helpers use `camelCase`, and Tailwind strings should pass through `cn`.
- Co-locate prop types with the component and replace stray `console` statements with typed helpers or tests.

## Testing Guidelines
- Jest with `@testing-library/react` should cover interactions; keep specs beside implementations as `*.test.tsx`.
- Assert accessibility flows (focus, keyboard, ARIA) plus critical data branches for each chart variant.
- Mirror new scenarios in Storybook to document behavior and expose visual regressions early.

## Commit & Pull Request Guidelines
- Write imperative commit subjects similar to history (`Add LineChart Component`, `Feat/bar chart`) with optional `(#123)` tags.
- Run lint, typecheck, and test before pushing, then report results inside the PR description.
- PRs must describe intent, link issues, and include screenshots or clips for UI changes.

## Storybook & Docs Workflow
- When component APIs shift, update `docs/`, Storybook stories, and CLI templates, then validate via `npm run dev:cli`.
- Keep `mario-charts.json` and `components.json` aligned with new exports so scaffolding metadata stays current.

## Specialized Agents
- Reference `agents/bar-chart-architect.md` when implementing or optimizing complex bar chart systems; it captures the dedicated persona, architecture standards, and workflow for high-stakes chart work.

## Mario Charts - React Dashboard Component Library

### Overview

Mario Charts is a modern React component library focused on charts and dashboards. Prioritizes beautiful visuals out-of-the-box, ease of use, and excellent developer experience through copy-and-paste components with zero lock-in.

### DX Philosophy - Developer Experience First

#### Core DX Principles

**"Documentation IS the product"** - Every interaction point is carefully crafted for developer success. We believe that the quality of developer experience directly correlates with adoption and satisfaction.

**Zero Friction Onboarding**
- No signup required to start
- No credit card or demo calls
- 5-minute guarantee from install to working chart
- First impression must be flawless

**Fail Fast, Succeed Faster**
- Clear error messages with actionable solutions
- Comprehensive TypeScript support prevents runtime errors
- Extensive testing ensures reliability
- Performance-first approach prevents scalability issues

#### Design Philosophy

**Beautiful Defaults, Infinite Customization**
- Components look professional out-of-the-box
- Zero configuration required for basic usage
- Deep customization available when needed
- Consistent design language across all components

**Copy-Paste Philosophy**
- Full ownership of component code
- No black box abstractions
- Easy to modify and extend
- AI-readable code structure

**Progressive Disclosure**
- Simple API for basic usage
- Advanced features available without complexity
- Clear upgrade paths for growing needs
- Modular architecture allows selective adoption

### Tech Stack

#### Core Dependencies
- **React** 18+ - Base for reusable components
- **Tailwind CSS** - Design system and styling
- **Radix UI** - Accessible primitives for interactive components
- **Recharts** (peer dependency) - Chart engine foundation
- **date-fns** - Date manipulation for filters
- **Framer Motion** - Advanced animations and micro-interactions

#### Distribution
- **shadcn/ui CLI system** - Copy-and-paste distribution for maximum flexibility
- **Custom registry** - Versioned and maintained components
- **Zero lock-in** - Users copy code directly to their project

#### Project Structure
```
mario-charts/
├── src/
│   ├── components/
│   │   ├── charts/          # Chart components
│   │   │   ├── bar-chart/
│   │   │   ├── line-chart/
│   │   │   ├── pie-chart/
│   │   │   ├── area-chart/
│   │   │   ├── scatter-plot/
│   │   │   ├── funnel-chart/
│   │   │   ├── gauge-chart/
│   │   │   └── heatmap/
│   │   ├── layout/          # Containers and layouts
│   │   │   ├── dashboard-grid/
│   │   │   ├── chart-container/
│   │   │   └── responsive-container/
│   │   ├── ui/              # Interface components
│   │   │   ├── kpi-card/
│   │   │   ├── data-table/
│   │   │   ├── progress-bar/
│   │   │   └── loading-states/
│   │   ├── filters/         # Filter components
│   │   │   ├── date-range-picker/
│   │   │   ├── multi-select/
│   │   │   └── slider-range/
│   │   └── primitives/      # Base components
│   │       ├── tooltip/
│   │       ├── legend/
│   │       └── empty-state/
│   ├── themes/              # Theme system
│   │   ├── tokens.ts        # Design tokens
│   │   ├── colors.ts        # Color palettes
│   │   └── presets.ts       # Pre-configured themes
│   ├── hooks/               # Custom React hooks
│   │   ├── use-chart.ts     # Main chart hook
│   │   ├── use-filter.ts    # Filter management
│   │   ├── use-resize.ts    # Resize detection
│   │   └── use-theme.ts     # Theme management
│   ├── utils/               # Utilities
│   │   ├── data-formatting.ts
│   │   ├── color-utils.ts
│   │   ├── chart-helpers.ts
│   │   └── performance.ts
│   └── types/               # TypeScript definitions
│       ├── chart-types.ts
│       ├── theme-types.ts
│       └── data-types.ts
├── docs/                    # Documentation
├── examples/                # Usage examples
└── playground/              # Interactive playground
```

### Core Components (MVP Roadmap)

#### Phase 1: Essential Core (Weeks 1-2)
1. **BarChart** - Bar chart (95% usage in corporate dashboards)
2. **LineChart** - Line chart for time series
3. **KPICard** - Metric cards with sparklines
4. **AreaChart** - Area chart for cumulative data

#### Phase 2: Fundamental Expansion (Weeks 3-4)
5. **PieChart/DonutChart** - Pie/donut charts
6. **DataTable** - Data table with filters and sorting
7. **StackedBarChart** - Stacked bar charts
8. **GaugeChart** - Gauge for targets and goals

#### Phase 3: Competitive Differentiation (Month 2)
9. **ScatterPlot** - Scatter plot for correlation analysis
10. **FunnelChart** - Conversion funnel
11. **Heatmap** - Heat map for patterns
12. **ProgressBar** - Progress indicators

### Code Standards & Performance

#### TypeScript Standards
```typescript
// Strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Generic data types with constraints
interface ChartData<T = Record<string, unknown>> {
  readonly data: readonly T[];
  readonly loading?: boolean;
  readonly error?: string | null;
}

// Proper prop definitions with JSDoc
interface BarChartProps<T extends Record<string, unknown>> {
  /** Chart data array */
  data: readonly T[];
  /** X-axis configuration */
  xAxis: {
    readonly dataKey: keyof T;
    readonly label?: string;
    readonly hide?: boolean;
  };
  /** Y-axis configuration */
  yAxis?: {
    readonly label?: string;
    readonly hide?: boolean;
    readonly domain?: readonly [number, number];
  };
  /** Color palette */
  colors?: readonly string[];
  /** Theme variant */
  theme?: 'light' | 'dark' | 'auto';
  /** Enable animations */
  animation?: boolean;
  /** Interactive features */
  interactive?: boolean;
  /** Custom tooltip component */
  tooltip?: {
    readonly enabled?: boolean;
    readonly custom?: React.ComponentType<TooltipProps>;
  };
  /** Event handlers */
  onBarClick?: (data: T, index: number) => void;
}
```

#### Performance Patterns
```typescript
// Memoization for expensive computations
const processedData = useMemo(() => {
  if (!data.length) return [];
  
  return data.map((item, index) => ({
    ...item,
    id: item.id ?? `item-${index}`,
    value: typeof item.value === 'number' ? item.value : 0,
  }));
}, [data]);

// Debounced resize handling
const { width, height } = useDebounceCallback(
  useResizeObserver(containerRef),
  100
);

// Virtualization for large datasets
const VirtualizedDataTable = memo(({ data }: { data: readonly unknown[] }) => {
  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef: scrollElementRef,
    estimateSize: 50,
    overscan: 5,
  });

  return (
    <div ref={scrollElementRef} className="overflow-auto">
      <div style={{ height: rowVirtualizer.totalSize }}>
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <TableRow
            key={virtualRow.index}
            data={data[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
});
```

#### React Performance Best Practices
```typescript
// Proper component composition
const ChartContainer = memo(({ children, className, ...props }: ChartContainerProps) => {
  return (
    <div 
      className={cn("chart-container", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

// Custom hooks for shared logic
const useChartData = <T>(
  data: readonly T[],
  options?: {
    readonly sortBy?: keyof T;
    readonly filterBy?: Partial<T>;
    readonly limit?: number;
  }
) => {
  const processedData = useMemo(() => {
    let result = [...data];
    
    if (options?.filterBy) {
      result = result.filter(item => 
        Object.entries(options.filterBy).every(([key, value]) => 
          item[key as keyof T] === value
        )
      );
    }
    
    if (options?.sortBy) {
      result.sort((a, b) => {
        const aVal = a[options.sortBy!];
        const bVal = b[options.sortBy!];
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    }
    
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    
    return result;
  }, [data, options]);
  
  return processedData;
};

// Error boundaries for robustness
class ChartErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultChartError;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

#### Bundle Optimization
```typescript
// Tree-shakeable exports
export { BarChart } from './bar-chart';
export { LineChart } from './line-chart';
export { KPICard } from './kpi-card';
export type { BarChartProps, LineChartProps, KPICardProps } from './types';

// Dynamic imports for heavy components
const HeavyChart = lazy(() => import('./heavy-chart'));

// Code splitting by feature
const AdminCharts = lazy(() => 
  import('./admin-charts').then(module => ({ default: module.AdminCharts }))
);

// Minimal re-renders with proper dependency arrays
const ChartTooltip = memo(({ data, position }: TooltipProps) => {
  const content = useMemo(() => {
    if (!data) return null;
    
    return (
      <div className="tooltip-content">
        <p className="font-medium">{data.label}</p>
        <p className="text-sm text-muted-foreground">
          {formatNumber(data.value)}
        </p>
      </div>
    );
  }, [data]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
      className="tooltip"
    >
      {content}
    </motion.div>
  );
});
```

#### Testing Standards
```typescript
// Unit tests for components
describe('BarChart', () => {
  const mockData = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 200 },
  ] as const;

  it('renders without crashing', () => {
    render(<BarChart data={mockData} xAxis={{ dataKey: 'name' }} />);
    expect(screen.getByRole('img', { name: /chart/i })).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<BarChart data={[]} xAxis={{ dataKey: 'name' }} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('calls onBarClick when bar is clicked', async () => {
    const handleClick = jest.fn();
    render(
      <BarChart 
        data={mockData} 
        xAxis={{ dataKey: 'name' }}
        onBarClick={handleClick}
      />
    );
    
    await user.click(screen.getByLabelText('Jan bar'));
    expect(handleClick).toHaveBeenCalledWith(mockData[0], 0);
  });
});

// Performance tests
describe('BarChart Performance', () => {
  it('renders large datasets efficiently', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      name: `Item ${i}`,
      value: Math.random() * 1000,
    }));

    const { rerender } = render(
      <BarChart data={largeData} xAxis={{ dataKey: 'name' }} />
    );

    const startTime = performance.now();
    rerender(<BarChart data={largeData} xAxis={{ dataKey: 'name' }} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Should render in <100ms
  });
});
```

### Design System & Visual Standards

#### Off-White Color Palette (Light Theme Focused)
```typescript
export const designSystem = {
  // Base backgrounds - Off-white elegance
  background: {
    primary: '#FEFEFE',      // Pure off-white for main areas
    secondary: '#FAFAFB',    // Subtle gray for cards and surfaces
    tertiary: '#F5F6F7',     // Light gray for sections and grouping
    surface: '#FFFFFF',      // True white for elevated elements
  },

  // Text hierarchy - Optimized for off-white backgrounds
  text: {
    primary: '#1A1D23',      // Almost black (16.2:1 contrast ratio - AAA)
    secondary: '#4A5568',    // Medium gray (7.8:1 contrast - AAA)
    tertiary: '#718096',     // Light gray (4.9:1 contrast - AA)
    muted: '#A0AEC0',        // Very light gray for subtle text
  },

  // Chart color palette - Data visualization optimized
  chart: {
    primary: '#3B82F6',      // Blue - primary data series
    secondary: '#10B981',    // Emerald - success/positive metrics
    tertiary: '#F59E0B',     // Amber - warning/neutral data
    quaternary: '#EF4444',   // Red - error/negative metrics
    
    // Extended 10-color palette for complex dashboards
    series: [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#F97316', '#EC4899', '#84CC16', '#6366F1'
    ]
  },

  // Interactive states
  interactive: {
    hover: 'rgba(59, 130, 246, 0.1)',
    active: 'rgba(59, 130, 246, 0.2)',
    focus: '#4299E1',
    disabled: '#E5E7EB',
  }
} as const;
```

#### Typography System
```typescript
export const typography = {
  // Font families
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  
  // Chart-specific typography scale
  chart: {
    title: 'text-lg font-semibold text-mario-text-primary',
    subtitle: 'text-sm font-medium text-mario-text-secondary',
    label: 'text-xs font-medium text-mario-text-tertiary',
    value: 'text-2xl font-bold text-mario-text-primary',
    caption: 'text-xs text-mario-text-muted',
  },

  // KPI card typography
  kpi: {
    title: 'text-sm font-medium text-mario-text-secondary',
    value: 'text-3xl font-bold text-mario-text-primary',
    change: 'text-sm font-medium',
    period: 'text-xs text-mario-text-muted',
  }
} as const;
```

#### Spacing & Layout System
```typescript
export const spacing = {
  // Chart-specific spacing
  chart: {
    padding: {
      sm: '0.75rem',    // 12px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
      xl: '2rem',       // 32px
    },
    margin: {
      sm: '0.5rem',     // 8px
      md: '1rem',       // 16px
      lg: '1.5rem',     // 24px
    },
    gap: {
      sm: '0.5rem',     // 8px - between chart elements
      md: '1rem',       // 16px - between components
      lg: '2rem',       // 32px - between sections
    }
  },

  // Dashboard grid system
  dashboard: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    card: 'p-6 space-y-4',
  }
} as const;
```

#### Component Design Patterns

**Card-Based Architecture**
```typescript
// Standard card wrapper for all chart components
const ChartCard = {
  container: 'bg-mario-bg-surface border border-mario-border-primary rounded-xl shadow-mario-sm',
  header: 'flex items-center justify-between p-6 pb-2',
  content: 'p-6 pt-0',
  footer: 'px-6 pb-6 pt-0 text-xs text-mario-text-muted'
};
```

**Loading State Patterns**
```typescript
// Skeleton loaders that match actual chart shapes
const LoadingPatterns = {
  barChart: 'animate-pulse bg-mario-bg-tertiary rounded',
  lineChart: 'animate-pulse bg-gradient-to-r from-mario-bg-tertiary to-transparent',
  kpiCard: 'space-y-3 animate-pulse',
  dataTable: 'space-y-2 animate-pulse'
};
```

**Responsive Design Breakpoints**
```typescript
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
} as const;

// Chart responsive behavior
export const chartResponsive = {
  // Height adjustments per breakpoint
  height: {
    sm: 'h-64',    // 256px on mobile
    md: 'h-80',    // 320px on tablet
    lg: 'h-96',    // 384px on desktop
  },
  
  // Legend positioning
  legend: {
    sm: 'bottom',  // Bottom on mobile
    md: 'bottom',  // Bottom on tablet  
    lg: 'right',   // Right on desktop
  }
};
```

#### Accessibility Standards
```typescript
export const a11y = {
  // Color contrast ratios (WCAG 2.1 AA compliance)
  contrast: {
    normal: '4.5:1',     // Normal text minimum
    large: '3:1',        // Large text minimum
    graphics: '3:1',     // Chart elements minimum
  },

  // Chart accessibility patterns
  chart: {
    // Always provide aria-labels for chart elements
    ariaLabel: 'data visualization',
    // Keyboard navigation support
    tabIndex: 0,
    // Screen reader descriptions
    description: 'Interactive chart showing {data description}',
  },

  // Focus management
  focus: {
    ring: 'focus:ring-2 focus:ring-mario-chart-primary focus:ring-offset-2',
    visible: 'focus-visible:outline-none focus-visible:ring-2',
  }
} as const;
```

#### Animation System (Framer Motion)

**Performance-First Animation Approach**
```typescript
// Chart entrance animations - optimized for 60fps
export const chartAnimations = {
  // Container animations
  container: {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1], // Custom easing curve
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  // Individual chart elements
  chartElement: {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 10
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  },

  // Data-driven animations (bars, lines, etc.)
  dataElement: {
    initial: { scaleY: 0, originY: 1 },
    animate: { 
      scaleY: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: (index: number) => index * 0.05 // Staggered reveal
      }
    }
  }
} as const;

// Micro-interactions for enhanced UX
export const microInteractions = {
  // Hover effects
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },

  // Click feedback
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },

  // Loading states
  loading: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
} as const;
```

**Motion Preferences & Performance**
```typescript
// Respect user motion preferences
export const motionConfig = {
  // Automatically reduce motion for users who prefer it
  respectMotionPreference: true,
  
  // Fallback for reduced motion
  reducedMotion: {
    transition: { duration: 0 },
    animate: { scale: 1, opacity: 1 }
  },
  
  // Performance optimizations
  optimizations: {
    // Use transform and opacity for better performance
    preferredProperties: ['transform', 'opacity'],
    // Enable hardware acceleration
    willChange: 'transform',
    // Use composite layers
    force3d: true
  }
} as const;
```

### CLI Architecture

#### Installation and Usage
```bash
# Initialize Mario Charts in your project
npx mario-charts@latest init

# Add individual components
npx mario-charts@latest add bar-chart line-chart kpi-card

# List all available components
npx mario-charts@latest list

# Update existing components
npx mario-charts@latest update bar-chart

# Check differences before updating
npx mario-charts@latest diff bar-chart
```

#### Configuration
```json
// mario-charts.json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "charts": "@/components/charts"
  }
}
```

#### Registry Structure
```
mario-charts-registry/
├── registry/
│   ├── charts/
│   │   ├── bar-chart.json
│   │   ├── line-chart.json
│   │   └── pie-chart.json
│   ├── ui/
│   │   ├── kpi-card.json
│   │   └── data-table.json
│   └── themes/
│       ├── default.json
│       └── dark.json
└── templates/
    ├── dashboard-basic/
    └── dashboard-advanced/
```

#### Component Registry Format
```json
{
  "name": "bar-chart",
  "type": "chart",
  "dependencies": ["@radix-ui/react-tooltip", "recharts"],
  "devDependencies": [],
  "registryDependencies": ["tooltip", "responsive-container"],
  "files": [
    {
      "name": "bar-chart.tsx",
      "content": "// Component code here..."
    }
  ],
  "meta": {
    "description": "Responsive and customizable bar chart component",
    "category": "charts",
    "subcategory": "basic"
  }
}
```

### Component API Examples

#### BarChart Component
```typescript
interface BarChartProps<T extends Record<string, unknown>> {
  data: readonly T[];
  xAxis: {
    readonly dataKey: keyof T;
    readonly label?: string;
    readonly hide?: boolean;
  };
  yAxis?: {
    readonly label?: string;
    readonly hide?: boolean;
    readonly domain?: readonly [number, number];
  };
  colors?: readonly string[];
  theme?: 'light' | 'dark' | 'auto';
  animation?: boolean;
  interactive?: boolean;
  tooltip?: {
    readonly enabled?: boolean;
    readonly custom?: React.ComponentType<TooltipProps>;
  };
  legend?: {
    readonly enabled?: boolean;
    readonly position?: 'top' | 'bottom' | 'left' | 'right';
  };
  loading?: boolean;
  error?: string;
  emptyState?: React.ReactNode;
  className?: string;
  onBarClick?: (data: T, index: number) => void;
}
```

#### KPICard Component
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    readonly value: number;
    readonly type: 'increase' | 'decrease';
    readonly period?: string;
  };
  sparkline?: {
    readonly data: readonly number[];
    readonly type: 'line' | 'bar' | 'area';
  };
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  className?: string;
}
```

### Custom Hooks

#### useChart Hook
```typescript
const useChart = <T>(config: ChartConfig<T>) => {
  const [data, setData] = useState<readonly T[]>(config.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateData = useCallback((newData: readonly T[]) => {
    setData(newData);
  }, []);
  
  const refresh = useCallback(() => {
    if (config.onRefresh) {
      setLoading(true);
      config.onRefresh()
        .then(setData)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [config.onRefresh]);
  
  return { data, loading, error, updateData, refresh } as const;
};
```

#### useFilter Hook
```typescript
const useFilter = <T>(initialData: readonly T[]) => {
  const [filteredData, setFilteredData] = useState(initialData);
  const [filters, setFilters] = useState<FilterState>({});
  
  const applyFilter = useCallback((key: string, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
    setFilteredData(initialData);
  }, [initialData]);
  
  useEffect(() => {
    const filtered = initialData.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined) return true;
        return (item as any)[key] === value;
      });
    });
    setFilteredData(filtered);
  }, [initialData, filters]);
  
  return { filteredData, filters, applyFilter, clearFilters } as const;
};
```

### Performance Optimization

#### Bundle Size
- **Zero runtime overhead** - Components copied to user's project
- **Native tree-shaking** - Only used code included in bundle
- **Peer dependencies** - Recharts, Framer Motion installed separately
- **Modular by design** - Install only needed components

#### Runtime Performance
- **Virtualization** for DataTable with >1000 rows
- **Memoization** to prevent unnecessary re-renders
- **Canvas fallback** for datasets >10k points
- **Debounced resize handlers** for responsive components
- **Lazy loading** for heavy chart components

#### Memory Management
```typescript
// Proper cleanup in components
useEffect(() => {
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(containerRef.current);
  
  return () => {
    resizeObserver.disconnect();
  };
}, []);

// WeakMap for caching to prevent memory leaks
const chartCache = new WeakMap();

// Debounced callbacks to reduce computation
const debouncedFilter = useMemo(
  () => debounce(applyFilter, 300),
  [applyFilter]
);
```

### Getting Started

#### Project Setup
```bash
# Install dependencies
npm install recharts date-fns framer-motion @radix-ui/react-tooltip

# Initialize Mario Charts
npx mario-charts@latest init

# Add your first components
npx mario-charts@latest add bar-chart kpi-card
```

#### Basic Usage
```tsx
import { BarChart } from '@/components/charts/bar-chart';
import { ThemeProvider } from '@/components/theme-provider';

const data = [
  { name: 'Jan', revenue: 1000 },
  { name: 'Feb', revenue: 1500 },
  { name: 'Mar', revenue: 1200 },
] as const;

function Dashboard() {
  return (
    <ThemeProvider theme="auto">
      <div className="p-6">
        <BarChart 
          data={data}
          xAxis={{ dataKey: 'name' }}
          yAxis={{ label: 'Revenue ($)' }}
          onBarClick={(data, index) => {
            console.log('Clicked:', data, index);
          }}
        />
      </div>
    </ThemeProvider>
  );
}
```

---

### Development Standards

#### Code Quality
- **ESLint + Prettier** for consistent formatting
- **Husky + lint-staged** for pre-commit hooks
- **TypeScript strict mode** with no implicit any
- **100% test coverage** for critical paths
- **Storybook** for component documentation
- **Semantic versioning** for releases

#### Performance Monitoring
- **Bundle analyzer** to track size increases
- **React DevTools Profiler** for render optimization
- **Lighthouse** scores for example pages
- **Web Vitals** tracking in documentation site

#### Accessibility Standards
- **WCAG 2.1 AA compliance** across all components
- **Screen reader optimization** with proper ARIA labels and descriptions
- **Keyboard navigation** support for all interactive elements
- **Focus management** with visible focus indicators and logical tab order
- **Color contrast** ratios exceeding 4.5:1 for normal text, 3:1 for large text
- **Motion sensitivity** with respect for `prefers-reduced-motion`
- **High contrast mode** support for Windows users
- **Zoom compatibility** up to 200% without horizontal scrolling

#### Future Roadmap

##### AI Dashboard Recommender (Post-MVP)
```typescript
interface DashboardRecommendation {
  readonly projectType: 'ecommerce' | 'saas' | 'marketing' | 'finance';
  readonly teamSize: number;
  readonly metrics: readonly string[];
  readonly recommendedCharts: readonly ChartRecommendation[];
  readonly layout: LayoutRecommendation;
}

const useDashboardAI = (requirements: ProjectRequirements) => {
  // Future hook for AI recommendations
};
```

---

### UI/UX Implementation Rules

The following comprehensive rules guide building accessible, fast, and delightful user interfaces. These are best practices that should be followed consistently across all components.

---

#### Interactions

##### Keyboard & Focus Management
- **Keyboard works everywhere.** All flows are keyboard-operable and follow the [WAI-ARIA Authoring Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- **Clear focus.** Every focusable element shows a visible focus ring. Prefer `:focus-visible` over `:focus` to avoid distracting pointer users. Set `:focus-within` for grouped controls
- **Manage focus.** Use focus traps, move and return focus according to the WAI-ARIA Patterns
- **Locale-aware keyboard shortcuts.** Internationalize keyboard shortcuts for non-QWERTY layouts. Show platform-specific symbols

##### Hit Targets & Touch
- **Match visual & hit targets.** Exception: if the visual target is < 24px, expand its hit target to ≥ 24px. On mobile, the minimum size is 44px
- **Mobile input size.** `<input>` font size is ≥ 16px on mobile to prevent iOS Safari auto-zoom/pan on focus. Or set `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />`
- **Respect zoom.** Never disable browser zoom
- **Prevent double-tap zoom on controls.** Set `touch-action: manipulation`
- **Tap highlight follows design.** Set `-webkit-tap-highlight-color` to match your design system

##### Inputs & Form Behavior
- **Hydration-safe inputs.** Inputs must not lose focus or value after hydration
- **Don't block paste.** Never disable paste in `<input>` or `<textarea>`
- **Don't block typing.** Even if a field only accepts numbers, allow any input and show validation feedback. Blocking keystrokes entirely is confusing because the user gets no explanation
- **Text replacements & expansions.** Some input methods add trailing whitespace. The input should trim the value to avoid showing a confusing error message
- **Don't pre-disable submit.** Allow submitting incomplete forms to surface validation feedback
- **Submission rule.** Keep submit enabled until submission starts; then disable during the in-flight request, show a spinner, and include an idempotency key
- **Enter submits.** When a text input is focused, Enter submits if it's the only control. If there are many controls, apply to the last control
- **Textarea behavior.** In `<textarea>`, ⌘/⌃+Enter submits; Enter inserts a new line
- **Labels everywhere.** Every control has a `<label>` or is associated with a label for assistive tech
- **Label activation.** Clicking a `<label>` focuses the associated control
- **No dead zones on controls.** Checkboxes and radios avoid dead zones; the label and control share a single generous hit target
- **Error placement.** Show errors next to their fields; on submit, focus the first error
- **Autocomplete & names.** Set `autocomplete` and meaningful `name` values to enable autofill
- **Spellcheck selectively.** Disable for emails, codes, usernames, etc.
- **Correct types & input modes.** Use the right `type` and `inputmode` for better keyboards and validation
- **Placeholders signal emptiness.** End with an ellipsis
- **Placeholder value.** Set placeholder to an example value or pattern e.g., `+1 (123) 456-7890` and `sk-012345679…`
- **Unsaved changes.** Warn before navigation when data could be lost
- **Password managers & 2FA.** Ensure compatibility and allow pasting one-time codes
- **Don't trigger password managers for non-auth fields.** For inputs like "Search" avoid reserved names (e.g., `password`), use `autocomplete="off"` or a specific token like `autocomplete="one-time-code"` for OTP fields
- **Windows `<select>` background.** Explicitly set `background-color` and `color` on native `<select>` to avoid dark-mode contrast bugs on Windows

##### Loading States
- **Loading buttons.** Show a loading indicator and keep the original label
- **Minimum loading-state duration.** If you show a spinner/skeleton, add a short show-delay (~150–300 ms) and a minimum visible time (~300–500 ms) to avoid flicker on fast responses. The `<Suspense>` component in React does this automatically

##### State & Navigation
- **URL as state.** Persist state in the URL so share, refresh, Back/Forward navigation work e.g., [nuqs](https://nuqs.dev)
- **Deep-link everything.** Filters, tabs, pagination, expanded panels, anytime `useState` is used
- **Scroll positions persist.** Back/Forward restores prior scroll
- **Links are links.** Use `<a>` or `<Link>` for navigation so standard browser behaviors work (Cmd/Ctrl+Click, middle-click, right-click to open in a new tab). Never substitute with `<button>` or `<div>` for navigational links

##### Feedback & Interactions
- **Optimistic updates.** Update the UI immediately when success is likely; reconcile on server response. On failure, show an error and roll back or provide Undo
- **Ellipsis for further input.** Menu options that open a follow-up e.g., "Rename…" end with an ellipsis
- **Confirm destructive actions.** Require confirmation or provide Undo with a safe window
- **Announce async updates.** Use polite `aria-live` for toasts and inline validation
- **Design forgiving interactions.** Controls minimize finickiness with generous hit targets, clear affordances, and predictable interactions, e.g., prediction cones
- **Tooltip timing.** Delay the first tooltip in a group; subsequent peers have no delay
- **No dead zones.** If part of a control looks interactive, it should be interactive. Don't leave users guessing where to interact

##### Touch/Drag/Scroll
- **Overscroll behavior.** Set `overscroll-behavior: contain` intentionally e.g., in modals/drawers
- **Clean drag interactions.** Disable text selection and apply `inert` (which prevents interaction) while an element is dragged so selection/hover don't occur simultaneously

##### Autofocus
- **Autofocus for speed.** On desktop screens with a single primary input, autofocus. Rarely autofocus on mobile because the keyboard opening can cause layout shift

---

#### Animations

- **Honor `prefers-reduced-motion`.** Provide a reduced-motion variant
- **Implementation preference.** Prefer CSS, avoid main-thread JS-driven animations when possible. Preference: CSS > Web Animations API > JavaScript libraries e.g., motion
- **Compositor-friendly.** Prioritize GPU-accelerated properties (`transform`, `opacity`) and avoid properties that trigger reflows/repaints (`width`, `height`, `top`, `left`)
- **Never `transition: all`.** Explicitly list only the properties you intend to animate (typically `opacity`, `transform`). `all` can unintentionally animate layout-affecting properties causing jank
- **Necessity check.** Only animate when it clarifies cause and effect or when it adds deliberate delight e.g., the northern lights
- **Easing fits the subject.** Choose easing based on what changes (size, distance, trigger)
- **Interruptible.** Animations are cancelable by user input
- **Input-driven.** Avoid autoplay; animate in response to actions
- **Correct transform origin.** Anchor motion to where it "physically" starts
- **Cross-browser SVG transforms.** Apply CSS transforms/animations to `<g>` wrappers and set `transform-box: fill-box; transform-origin: center;`. Safari historically had bugs with `transform-origin` on SVG and grouping avoids origin miscalculation
- **Text anti-aliasing & transforms.** Scaling text can change smoothing. Prefer animating a wrapper instead of the text node. If artifacts persist set `translateZ(0)` or `will-change: transform` to promote to its own layer

---

#### Layout

- **Optical alignment.** Adjust ±1px when perception beats geometry
- **Deliberate alignment.** Every element aligns with something intentionally whether to a grid, baseline, edge, or optical center. No accidental positioning
- **Balance contrast in lockups.** When text and icons sit side by side, adjust weight, size, spacing, or color so they don't clash. For example, a thin-stroke icon may need a bolder stroke next to medium-weight text
- **Responsive coverage.** Verify on mobile, laptop, and ultra-wide. For ultra-wide, zoom out to 50% to simulate
- **Respect safe areas.** Account for notches and insets with safe-area variables
- **No excessive scrollbars.** Only render useful scrollbars; fix overflow issues to prevent unwanted scrollbars. On macOS set "Show scroll bars" to "Always" to test what Windows users would see
- **Let the browser size things.** Prefer flex/grid/intrinsic layout over measuring in JS. Avoid layout thrash by letting CSS handle flow, wrapping, and alignment

---

#### Content & Accessibility

##### Content Strategy
- **Inline help first.** Prefer inline explanations; use tooltips as a last resort
- **Stable skeletons.** Skeletons mirror final content exactly to avoid layout shift
- **Accurate page titles.** `<title>` reflects the current context
- **No dead ends.** Every screen offers a next step or recovery path
- **All states designed.** Empty, sparse, dense, and error states
- **Resilient to user-generated content.** Layouts handle short, average, and very long content

##### Typography & Formatting
- **Typographic quotes.** Prefer curly quotes (“ ”) over straight quotes (" ")
- **Avoid widows/orphans.** Tidy rag and line breaks
- **Use the ellipsis character.** `…` over three periods `...`
- **Tabular numbers for comparisons.** Use `font-variant-numeric: tabular-nums` or a monospace like Geist Mono
- **Non-breaking spaces for glued terms.** Use a non-breaking space `&nbsp;` to keep units, shortcuts and names together: `10 MB` → `10&nbsp;MB`, `⌘ + K` → `⌘&nbsp;+&nbsp;K`, `Vercel SDK` → `Vercel&nbsp;SDK`. Use `&#x2060;` for no space

##### Internationalization
- **Locale-aware formats.** Format dates, times, numbers, delimiters, and currencies for the user's locale
- **Prefer language settings over location.** Detect language via `Accept-Language` header and `navigator.languages`. Never rely on IP/GPS for language

##### Accessibility Standards
- **Redundant status cues.** Don't rely on color alone; include text labels
- **Icons have labels.** Convey the same meaning with text for non-sighted users
- **Icon-only buttons are named.** Provide a descriptive `aria-label`
- **Don't ship the schema.** Visual layouts may omit visible labels, but accessible names/labels still exist for assistive tech
- **Accessible content.** Set accurate names (`aria-label`), hide decoration (`aria-hidden`) and verify in the accessibility tree
- **Semantics before ARIA.** Prefer native elements (`button`, `a`, `label`, `table`), before `aria-*`
- **Headings & skip link.** Hierarchical `<h1–h6>` and a "Skip to content" link
- **Anchored headings.** Set `scroll-margin-top` for headers when linking to sections

##### Brand & Resources
- **Brand resources from the logo.** Right-click the nav logo to surface brand assets for quick access

---

#### Performance

##### Testing & Measurement
- **Device/browser matrix.** Test iOS Low Power Mode and macOS Safari
- **Measure reliably.** Disable extensions that add overhead or change runtime behavior
- **Track re-renders.** Minimize and make re-renders fast. Use React DevTools or React Scan
- **Throttle when profiling.** Test with CPU and network throttling

##### Optimization Strategies
- **Minimize layout work.** Batch reads/writes; avoid unnecessary reflows/repaints
- **Network latency budgets.** `POST`/`PATCH`/`DELETE` complete in <500ms
- **Keystroke cost.** Prefer uncontrolled inputs; make controlled loops cheap
- **Don't use the main thread for expensive work.** Move especially long tasks to Web Workers to avoid blocking interaction with the page

##### Assets & Loading
- **Large lists.** Virtualize large lists e.g., `virtua` or `content-visibility: auto`
- **Preload wisely.** Preload only above-the-fold images; lazy-load the rest
- **No image-caused CLS.** Set explicit image dimensions and reserve space
- **Preconnect to origins.** Use `<link rel="preconnect">` for asset/CDN domains (with `crossorigin` when needed) to reduce DNS/TLS latency
- **Preload fonts.** For critical text to avoid flash and layout shift
- **Subset fonts.** Ship only the code points/scripts you use via `unicode-range` (limit variable axes to what you need) to shrink size

---

#### Design

##### Visual Hierarchy
- **Layered shadows.** Mimic ambient + direct light with at least two layers
- **Crisp borders.** Combine borders and shadows; semi-transparent borders improve edge clarity
- **Nested radii.** Child radius ≤ parent radius and concentric so curves align
- **Hue consistency.** On non-neutral backgrounds, tint borders/shadows/text toward the same hue

##### Contrast & Color
- **Accessible charts.** Use color-blind-friendly palettes
- **Minimum contrast.** Prefer [APCA](https://apcacontrast.com/) over WCAG 2 for more accurate perceptual contrast
- **Interactions increase contrast.** `:hover`, `:active`, `:focus` have more contrast than rest state

##### Browser Integration
- **Browser UI matches your background.** Set `<meta name="theme-color" content="#000000">` to align the browser's theme color with the page background
- **Set the appropriate color-scheme.** Style the `<html>` tag with `color-scheme: dark` in dark themes so that scrollbars and other device UI have proper contrast

##### Polish
- **Avoid gradient banding.** Some colors and display types will have color banding. Masks can be used instead

---

### Copywriting Guidelines

These guidelines help create clear, consistent, and user-friendly content across all components and documentation.

#### Voice & Tone
- **Active voice.** Instead of "The CLI will be installed," say "Install the CLI"
- **Be clear & concise.** Use as few words as possible
- **Prefer `&` over `and`**
- **Action-oriented language.** Instead of "You will need the CLI…" say "Install the CLI…"
- **Write in second person.** Avoid first person
- **Default to positive language.** Frame messages in an encouraging, problem-solving way, even for errors. Instead of "Your deployment failed," say "Something went wrong—try again or contact support"

#### Formatting & Style
- **Headings & buttons use Title Case (Chicago).** On marketing pages, use sentence case
- **Keep nouns consistent.** Introduce as few unique terms as possible
- **Use numerals for counts.** Instead of "eight deployments" say "8 deployments"
- **Separate numbers & units with a space.** Instead of `10MB` say `10 MB`. Use a non-breaking space e.g., `10&nbsp;MB`
- **Consistent currency formatting.** In any given context, display currency with either 0 or 2 decimal places, never mix both

#### Placeholders
- **Use consistent placeholders:**
  - Strings: `YOUR_API_TOKEN_HERE`
  - Numbers: `0123456789`

#### Error Messages
- **Error messages guide the exit.** Don't just state what went wrong—tell the user how to fix it. Instead of "Invalid API key," say "Your API key is incorrect or expired. Generate a new key in your account settings." The copy and buttons/links should educate and give a clear action

#### Clarity
- **Avoid ambiguity.** Labels are clear and specific. Instead of the button label "Continue" say "Save API Key"
