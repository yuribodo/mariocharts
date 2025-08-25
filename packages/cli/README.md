# Mario Charts CLI

Modern React component library for charts and dashboards with beautiful visuals out-of-the-box.

## Installation

```bash
# Install globally
npm install -g mario-charts

# Or use directly with npx
npx mario-charts@latest init
```

## Quick Start

```bash
# Initialize Mario Charts in your project
npx mario-charts@latest init

# Add components to your project
npx mario-charts@latest add bar-chart line-chart

# List all available components
npx mario-charts@latest list

# Browse components by type
npx mario-charts@latest list --type chart
```

## Commands

### `init`
Initialize Mario Charts in your React project.

```bash
mario-charts init [options]

Options:
  -y, --yes                    Skip confirmation prompts
  --defaults                   Use default configuration
  -c, --cwd <path>            Working directory
  --components <components...> Install components during init
```

### `add`
Add components to your project.

```bash
mario-charts add [components...] [options]

Options:
  -y, --yes         Skip confirmation prompts
  -o, --overwrite   Overwrite existing files
  -a, --all         Add all available components
  -c, --cwd <path>  Working directory
  --silent          Run in silent mode
```

### `list`
List available components.

```bash
mario-charts list [options]

Options:
  -t, --type <type>    Filter by type (chart, ui, layout, filter, primitive)
  -s, --search <query> Search components
  -d, --detailed       Show detailed information
```

## Component Types

- **Charts**: `bar-chart`, `line-chart`, `pie-chart`, `area-chart`
- **UI**: `kpi-card`, `data-table`, `progress-bar`
- **Layout**: `dashboard-grid`, `chart-container`
- **Filters**: `date-range-picker`, `multi-select`
- **Primitives**: `tooltip`, `legend`, `empty-state`

## Requirements

- Node.js 18+
- React 18+
- Tailwind CSS

## Documentation

Visit [mariocharts.com](https://mariocharts.com) for full documentation.

## License

MIT License - see LICENSE file for details.