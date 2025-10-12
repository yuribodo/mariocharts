# Changelog

All notable changes to Mario Charts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-01-12

### Fixed
- **StackedBarChart [CRITICAL]** - Fixed per-bar normalization bug where all bars appeared same size regardless of actual values
  - Now uses global scale across all bars for accurate magnitude comparison
  - Bars with totals of 20 vs 200 now correctly show proportional heights
- **StackedBarChart [CRITICAL]** - Stabilized baseline calculation for mixed positive/negative values
  - Baseline now uses globalMaxNegative instead of per-bar negativeSum
  - Prevents baseline from jumping between bars
- **StackedBarChart** - Added segment boundary clamping to prevent overflow outside SVG bounds
  - All x/y/width/height values clamped to chart dimensions
- **StackedBarChart** - Added error boundaries for malformed data
  - Try-catch wrapper around calculations
  - Validates dimensions and sums are finite
  - Returns empty array gracefully on errors
- **Documentation** - Fixed TypeScript errors in docs page
  - Corrected import paths
  - Added proper SegmentSelection interface
  - Typed all callbacks explicitly

## [0.2.0] - 2025-01-12

### Added
- **StackedBarChart Component** - A powerful new chart component for multi-category data visualization
  - Support for multiple stacked data series
  - Positive and negative values with intelligent baseline positioning
  - Filled and outline variants
  - Vertical and horizontal orientations
  - Interactive tooltips showing all segments and totals
  - Optional legend display
  - Keyboard accessibility (WCAG 2.1 AA compliant)
  - Click handlers for individual segments
  - Smooth animations with Framer Motion
  - Performance optimized for large datasets
  - Full TypeScript support with generics

### Fixed
- **StackedBarChart** - Invisible hit area width calculation in horizontal + outline mode now correctly spans the entire bar
- **StackedBarChart** - Proper rendering of mixed positive/negative values with separate baseline logic
- **StackedBarChart** - Click handlers and hover states now work correctly in outline variant
- **StackedBarChart** - Keyboard accessibility improved with focus handlers triggering tooltips

### Documentation
- Added comprehensive documentation page for StackedBarChart at `/docs/components/stacked-bar-chart`
- 9 interactive examples showcasing different configurations
- Complete API reference with all 13 props documented
- Added to sidebar navigation and components index

### CLI
- StackedBarChart now available via CLI: `npx mario-charts@latest add stacked-bar-chart`
- Registry updated with complete component definition

## [0.1.7] - 2025-01-10

### Added
- Initial BarChart component with vertical and horizontal orientations
- Initial LineChart component with multiple series support
- CLI tool for component installation
- Basic documentation structure

