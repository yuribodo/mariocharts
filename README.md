# 📊 Mario Charts

**Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box**

Mario Charts prioritizes ease of use, excellent developer experience, and zero lock-in through copy-and-paste components.

[![npm version](https://badge.fury.io/js/mario-charts.svg)](https://www.npmjs.com/package/mario-charts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

- 📈 **Beautiful Charts Out-of-the-Box** - Stunning visuals with minimal configuration
- 🎨 **Multiple Variants & Orientations** - Filled/outline styles with vertical/horizontal layouts
- 📱 **Responsive by Default** - Works perfectly on all screen sizes
- ♿ **Accessibility First** - ARIA roles and labels on every chart and data point, with keyboard-focusable elements
- 🎭 **Smooth Animations** - Powered by Framer Motion for delightful interactions
- 📦 **Zero Lock-in** - Copy-and-paste components directly to your project
- 🔧 **TypeScript Native** - Full type safety and excellent IntelliSense
- ⚡ **Performance Optimized** - Virtualization, memoization, and tree-shaking

## 🚀 Quick Start

### Installation

Mario Charts is published as a [shadcn registry](https://ui.shadcn.com/docs/registry).
In any React project with a `components.json`, add a chart directly by URL:

```bash
npx shadcn@latest add https://mariocharts.com/r/bar-chart.json
```

Dependencies are resolved automatically — nothing else to install.

To install charts by short name, register the namespace once in your
`components.json`:

```json
{
  "registries": {
    "@mariocharts": "https://mariocharts.com/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @mariocharts/bar-chart @mariocharts/line-chart
```

Every available chart is listed at
[mariocharts.com/r/registry.json](https://mariocharts.com/r/registry.json).

<details>
<summary>Using the Mario Charts CLI instead</summary>

```bash
npx mario-charts@latest init
npx mario-charts@latest add bar-chart line-chart
```

</details>

### Basic Usage

```tsx
import { BarChart } from '@/components/charts/bar-chart';

const data = [
  { name: 'Jan', revenue: 1000 },
  { name: 'Feb', revenue: 1500 },
  { name: 'Mar', revenue: 1200 },
] as const;

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <BarChart 
        data={data}
        x="name"
        y="revenue"
        variant="filled"
        orientation="vertical"
        onBarClick={(data, index) => {
          console.log('Clicked:', data, index);
        }}
      />
    </div>
  );
}
```

### Advanced Examples

```tsx
// Outline variant with horizontal orientation
<BarChart 
  data={data}
  x="product"
  y="sales"
  variant="outline"
  orientation="horizontal"
  height={400}
  colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
/>

// Vertical filled bars with custom styling
<BarChart 
  data={data}
  x="month"
  y="revenue"
  variant="filled"
  orientation="vertical"
  animation={true}
  onBarClick={(data, index) => {
    // Handle bar interactions
    console.log(`Selected: ${data.month} - $${data.revenue}`);
  }}
/>
```

## 📚 Components

### Phase 1: Essential Core
- ✅ **BarChart** - Responsive bar charts with filled/outline variants, vertical/horizontal orientations, and smooth animations
- ✅ **LineChart** - Time series line charts
- ✅ **AreaChart** - Area charts for cumulative data

### Phase 2: Fundamental Expansion
- ✅ **PieChart/DonutChart** - Pie and donut charts
- ✅ **StackedBarChart** - Multi-series bar charts
- ✅ **GaugeChart** - Progress and goal indicators
- ⏳ **DataTable** - Data tables with filters and sorting

### Phase 3: Advanced Features
- ✅ **ScatterPlot** - Correlation analysis charts
- ✅ **Heatmap** - Pattern recognition charts
- ✅ **RadarChart** - Multi-axis comparison charts
- ✅ **FunnelChart** - Conversion and drop-off charts
- ✅ **TreeMapChart** - Hierarchical area charts
- ⏳ **ProgressBar** - Custom progress indicators

## 🎨 Design System

### Color Palette
```tsx
const chartColors = {
  primary: 'hsl(210 100% 50%)',   // Blue
  secondary: 'hsl(340 100% 50%)', // Pink  
  success: 'hsl(120 100% 40%)',   // Green
  warning: 'hsl(45 100% 50%)',    // Orange
  danger: 'hsl(0 84% 60%)',       // Red
};
```

### Theme Configuration
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "cssVariables": true
  }
}
```

## ⚡ Performance

Mario Charts is built with performance in mind:

- **Bundle Size**: Zero runtime overhead through copy-paste distribution
- **Tree Shaking**: Only used components are included in your bundle
- **Virtualization**: Handle datasets with 10k+ rows efficiently
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Components load on-demand

### Performance Benchmarks

| Dataset Size | Render Time | Memory Usage |
|--------------|-------------|--------------|
| 100 rows     | <50ms       | ~2MB         |
| 1,000 rows   | <100ms      | ~8MB         |
| 10,000 rows  | <300ms      | ~25MB        |

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- React 18+
- TypeScript (recommended)

### Local Development

```bash
# Clone the repository
git clone https://github.com/mariocharts/mario-charts.git
cd mario-charts

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start Storybook
npm run storybook
```

### Project Structure

```
mario-charts/
├── src/
│   ├── components/
│   │   ├── charts/          # Chart components
│   │   ├── ui/              # UI components  
│   │   ├── layout/          # Layout components
│   │   └── primitives/      # Base components
│   ├── themes/              # Design tokens
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript definitions
├── docs/                    # Documentation
├── examples/                # Usage examples
└── playground/              # Interactive playground
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-chart`)
3. **Commit** your changes (`git commit -m 'Add amazing chart component'`)
4. **Push** to the branch (`git push origin feature/amazing-chart`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript** with strict mode enabled
- **ESLint** for code quality
- **Prettier** for formatting
- **Testing** with Jest and React Testing Library
- **Storybook** for component documentation

## 📖 Documentation

- 📚 [Component Documentation](https://mario-charts.dev/docs)

## 📄 License

Mario Charts is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Mario Charts is built on top of these amazing open source projects:

- [Radix UI](https://radix-ui.com/) - Accessible component primitives  
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://framer.com/motion/) - Animation library
- [Next.js](https://nextjs.org/) - React framework

---

**Made with ❤️ by the Mario Charts team**

[🐦 Twitter](https://twitter.com/marioyuriofc)
