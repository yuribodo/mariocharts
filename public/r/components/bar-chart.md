# Bar Chart

A responsive and customizable bar chart component with animations, hover states, and TypeScript support. Supports both vertical and horizontal orientations, filled and outline variants.

## Installation

```bash
npx shadcn add https://mariocharts.com/r/bar-chart
```

## Usage

```tsx
import { BarChart } from "@/components/charts/bar-chart"

const data = [
  { name: "Jan", revenue: 1000 },
  { name: "Feb", revenue: 1500 },  
  { name: "Mar", revenue: 1200 },
  { name: "Apr", revenue: 1800 },
  { name: "May", revenue: 2000 },
]

export function RevenueChart() {
  return (
    <BarChart
      data={data}
      x="name"
      y="revenue" 
      height={400}
      onBarClick={(data, index) => {
        console.log('Clicked bar:', data, index)
      }}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `readonly T[]` | - | Array of data objects |
| `x` | `keyof T` | - | Key for x-axis values (labels) |
| `y` | `keyof T` | `'value'` | Key for y-axis values (numeric data) |
| `colors` | `readonly string[]` | `DEFAULT_COLORS` | Array of colors for bars |
| `className` | `string` | - | Additional CSS classes |
| `height` | `number` | `300` | Chart height in pixels |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string \| null` | `null` | Error message to display |
| `animation` | `boolean` | `true` | Enable animations |
| `variant` | `'filled' \| 'outline'` | `'filled'` | Bar style variant |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Chart orientation |
| `onBarClick` | `(data: T, index: number) => void` | - | Click handler for bars |

## Examples

### Basic Usage

```tsx
import { BarChart } from "@/components/charts/bar-chart"

const data = [
  { month: "Jan", sales: 1000 },
  { month: "Feb", sales: 1500 },
  { month: "Mar", sales: 1200 },
]

export function SalesChart() {
  return <BarChart data={data} x="month" y="sales" />
}
```

### Horizontal Orientation

```tsx
<BarChart
  data={data}
  x="name"
  y="value"
  orientation="horizontal"
  height={300}
/>
```

### Outline Variant

```tsx
<BarChart
  data={data}
  x="name"
  y="value"
  variant="outline"
  colors={["#3b82f6", "#10b981", "#f59e0b"]}
/>
```

### Custom Colors

```tsx
<BarChart
  data={data}
  x="name" 
  y="value"
  colors={["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"]}
/>
```

### Loading State

```tsx
<BarChart data={[]} x="name" y="value" loading={true} />
```

### Error State

```tsx
<BarChart 
  data={[]} 
  x="name" 
  y="value" 
  error="Failed to load chart data" 
/>
```

### Click Handler

```tsx
<BarChart
  data={data}
  x="name"
  y="value"
  onBarClick={(data, index) => {
    alert(`Clicked on ${data.name} with value ${data.value}`)
  }}
/>
```

## Features

- **Responsive Design**: Automatically adapts to container width
- **TypeScript Support**: Fully typed with generic data shapes
- **Animations**: Smooth enter/exit animations with Framer Motion
- **Interactive**: Hover effects and click handlers
- **Customizable**: Colors, orientation, variants, and styling
- **Accessible**: ARIA labels and keyboard navigation support
- **Loading States**: Built-in loading and error states
- **Performance**: Optimized for large datasets with proper memoization

## Dependencies

This component requires the following dependencies:

- `framer-motion` - For animations
- `class-variance-authority` - For variant handling  
- `clsx` - For conditional classes
- `tailwind-merge` - For merging Tailwind classes

These will be automatically installed when you add the component via the shadcn CLI.