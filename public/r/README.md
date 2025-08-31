# Mario Charts Registry

This is the official shadcn/ui registry for Mario Charts components. Use the shadcn CLI to add components directly to your project.

## Quick Start

```bash
# Add the Bar Chart component to your project
npx shadcn add https://mariocharts.com/r/bar-chart

# Or if testing locally
npx shadcn add ./public/r/components/bar-chart.json
```

## Available Components

### Charts
- **bar-chart** - Responsive bar chart with animations and TypeScript support

## Usage

After adding a component, you can import and use it in your React application:

```tsx
import { BarChart } from "@/components/charts/bar-chart"

const data = [
  { name: "Jan", value: 1000 },
  { name: "Feb", value: 1500 },
  { name: "Mar", value: 1200 },
]

export function MyChart() {
  return (
    <BarChart
      data={data}
      x="name"
      y="value"
      height={300}
    />
  )
}
```

## Registry Structure

```
public/r/
├── registry.json              # Main registry configuration
├── components/
│   ├── bar-chart.json        # Component registry item
│   └── bar-chart.md          # Component documentation
└── examples/
    └── bar-chart-demo.tsx    # Usage examples
```

## Component Requirements

All components in this registry:

- ✅ Follow shadcn/ui patterns and conventions
- ✅ Support TypeScript with proper generic types  
- ✅ Use Tailwind CSS for styling
- ✅ Include proper accessibility attributes
- ✅ Have comprehensive documentation
- ✅ Include usage examples and demos
- ✅ Support responsive design
- ✅ Include loading and error states

## Dependencies

Components may require these peer dependencies:

- `framer-motion` - For animations
- `class-variance-authority` - For variant handling
- `clsx` - For conditional classes  
- `tailwind-merge` - For merging Tailwind classes

The shadcn CLI will automatically install required dependencies when adding components.

## Development

To verify the registry structure:

```bash
npm run registry:verify
```

To build and verify the registry:

```bash
npm run registry:build
```

## Contributing

When adding new components to the registry:

1. Create the component following shadcn/ui patterns
2. Add it to `registry.json`
3. Create individual component registry JSON file
4. Add comprehensive documentation
5. Include usage examples
6. Run verification scripts

## Schema

This registry follows the official shadcn/ui registry schema:
- [Registry Schema](https://ui.shadcn.com/schema/registry.json)
- [Component Schema](https://ui.shadcn.com/schema/registry-item.json)

## License

Mario Charts components are available under the MIT license.