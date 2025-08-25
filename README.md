# 📊 Mario Charts

**Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box**

Mario Charts prioritizes ease of use, excellent developer experience, and zero lock-in through copy-and-paste components.

[![npm version](https://badge.fury.io/js/mario-charts.svg)](https://www.npmjs.com/package/mario-charts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

- 📈 **Beautiful Charts Out-of-the-Box** - Stunning visuals with minimal configuration
- 🎨 **Customizable Design System** - Built on Tailwind CSS with design tokens
- 📱 **Responsive by Default** - Works perfectly on all screen sizes
- ♿ **Accessibility First** - Built with Radix UI primitives for full accessibility
- 🎭 **Smooth Animations** - Powered by Framer Motion for delightful interactions
- 📦 **Zero Lock-in** - Copy-and-paste components directly to your project
- 🔧 **TypeScript Native** - Full type safety and excellent IntelliSense
- ⚡ **Performance Optimized** - Virtualization, memoization, and tree-shaking

## 🚀 Quick Start

### Installation

```bash
# Initialize Mario Charts in your project
npx mario-charts@latest init

# Add individual components
npx mario-charts@latest add bar-chart kpi-card

# Install peer dependencies
npm install recharts date-fns framer-motion @radix-ui/react-tooltip
```

### Basic Usage

```tsx
import { BarChart, KPICard } from '@/components/charts';

const data = [
  { name: 'Jan', revenue: 1000 },
  { name: 'Feb', revenue: 1500 },
  { name: 'Mar', revenue: 1200 },
] as const;

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Revenue"
          value={3700}
          change={{ value: 12.5, type: "increase", period: "last month" }}
        />
        <KPICard
          title="Active Users"
          value="2.4K"
          change={{ value: 8.2, type: "increase", period: "last week" }}
        />
        <KPICard
          title="Conversion Rate"
          value="3.2%"
          change={{ value: 2.1, type: "decrease", period: "yesterday" }}
        />
      </div>
      
      <BarChart 
        data={data}
        xAxis={{ dataKey: 'name' }}
        yAxis={{ label: 'Revenue ($)' }}
        onBarClick={(data, index) => {
          console.log('Clicked:', data, index);
        }}
      />
    </div>
  );
}
```

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
- **Storybook** for component documentation

## 📄 License

Mario Charts is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Mario Charts is built on top of these amazing open source projects:

- [Recharts](https://recharts.org/) - Chart rendering engine
- [Radix UI](https://radix-ui.com/) - Accessible component primitives  
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://framer.com/motion/) - Animation library
- [Next.js](https://nextjs.org/) - React framework

---

**Made with ❤️ by the Mario Charts team**
