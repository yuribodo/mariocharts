# Premium Ecosystem Redesign

## Status

Approved design direction. Implementation has not started.

## Objective

Unify the Mario Charts home page, documentation, component pages, and dashboard examples into a premium developer-tool ecosystem. Use Geist as a reference for interface precision and Resend as a reference for product presentation, while building a distinct identity around excellent chart components and visible developer experience.

## Reference Synthesis

### Geist contributes structure

- Predictable grid and navigation.
- Compact, legible type scales.
- One-pixel borders and restrained elevation.
- Familiar controls with complete interaction states.
- Dense product surfaces that remain easy to scan.

### Resend contributes atmosphere

- Simple, modern, and memorable communication.
- Code and working product shown early.
- Careful contrast and restrained material treatment.
- A coherent experience across marketing, docs, and product.

### Mario Charts contributes the signature

- Code, controls, and rendered output form one interactive surface.
- Charts demonstrate the product instead of decorating the page.
- Axes, legends, tooltips, empty states, accessibility, and motion share a recognizable grammar.
- Multi-series colors are functional and accessible, not a fixed brand palette.

The result must feel compatible with leading developer tools without resembling a re-skinned Vercel or Resend page.

## Experience Principles

1. Show a working chart before explaining the product.
2. Keep installation, preview, API, and source code close together.
3. Create hierarchy through typography, spacing, and dividers before introducing cards.
4. Reserve motion for chart transitions, state changes, and feedback.
5. Adapt density by surface while preserving one component vocabulary.

## Visual System

### Theme

Use a light-first, neutral interface suited to developers reading documentation and comparing charts during normal daytime work. Dark mode remains fully supported but is not the visual shortcut for premium positioning.

### Color

- Use tinted near-white and near-black neutrals instead of pure white and black.
- Keep navigation, documentation, and dashboard chrome predominantly neutral.
- Use a six-color data palette covering blue, green, amber, coral, violet, and cyan.
- Assign colors to series or semantic roles; never scatter them as decoration.
- Provide patterns, symbols, direct labels, or other redundant distinctions where color alone would be ambiguous.
- Define light and dark variants in OKLCH and verify WCAG contrast.

### Typography

- Use Geist Sans for navigation, UI, headings, and prose.
- Use Geist Mono for code, commands, technical identifiers, and tabular technical metadata.
- Use tabular figures for metrics and axis values.
- Keep product and docs scales compact. Reserve large display type for the home hero only.
- Keep prose between 65 and 75 characters per line.

### Shape and elevation

- Use radii from 4px to 8px for controls and framed tools.
- Use one-pixel dividers to organize connected regions.
- Avoid nested cards and repeated floating sections.
- Use shadows only where layering communicates behavior, such as menus, popovers, and sticky overlays.
- Remove decorative blur and glass effects from default surfaces.

### Motion

- Keep control and state transitions between 150ms and 220ms.
- Use exponential ease-out curves.
- Animate transforms and opacity rather than layout properties.
- Concentrate expressive motion in chart changes and code-to-preview feedback.
- Disable non-essential motion under `prefers-reduced-motion` without removing content.

## Surface Design

### Global navigation

- Use one header vocabulary across home, docs, and examples.
- Keep logo, Charts, Examples, Docs, theme control, and GitHub consistently placed.
- Use restrained active states based on contrast, underline, or surface change.
- Avoid glass navigation as the default treatment.

### Home

- Keep the hero within the first viewport while revealing the beginning of the next section.
- Lead with a literal product promise, a copyable CLI command, and a real interactive chart.
- Replace broad claims with evidence: rendered variants, live customization, accessible states, and source ownership.
- Avoid split marketing cards and repeated feature grids.
- Use varied full-width sections: interactive chart lab, component index, code-to-preview workflow, and dashboard composition.
- Keep easter eggs optional and outside primary conversion or navigation paths.

### Documentation

- Use a stable three-region layout: component navigation, reading column, and on-page table of contents.
- Place the one-minute quickstart and copyable command near the introduction.
- Standardize component pages in this order: overview, live example, installation, usage, variants, API, accessibility, and troubleshooting.
- Integrate code and preview so a changed prop highlights both its source line and rendered effect.
- Use compact tables and structured metadata instead of prose for API comparison.
- Provide clear previous and next navigation and preserve reading position.

### Component discovery

- Replace generic component cards with a visual index centered on real chart previews.
- Support scanning by chart purpose, data shape, and comparison task.
- Show availability, interaction support, and installation command as secondary metadata.
- Keep previews at stable dimensions so labels, loading states, and controls do not shift the layout.

### Examples and dashboards

- Build dashboards from connected grids and dividers rather than independent floating cards.
- Use typography, alignment, and whitespace to group related metrics.
- Give each example a realistic analytical question and dataset.
- Expose relevant source code and component composition from the example.
- Use tabular figures and accessible data-series distinctions.
- Adapt mobile dashboards structurally instead of merely stacking every desktop panel.

## Shared Components

The redesign should establish reusable primitives before individual page polish:

- `EcosystemHeader`
- `PageFrame`
- `SectionHeader`
- `CommandSnippet`
- `CodePreview`
- `ChartPreview`
- `DataLegend`
- `ComponentMetadata`
- `DocsPager`
- shared button, tab, tooltip, menu, and focus-state variants

Each interactive component must define default, hover, focus, active, disabled, loading, and error states where applicable.

## Content Direction

- Prefer literal descriptions and short sentences.
- Replace statements such as "beautiful" with demonstrations of the relevant quality.
- Use consistent component names and CLI commands across home, docs, registry, and examples.
- Avoid repeating headings in supporting copy.
- Keep calls to action specific: `Install Bar Chart`, `View API`, `Open Example`, and `Copy Command`.

## Accessibility Criteria

- Text and interactive controls meet WCAG 2.1 AA contrast.
- Charts provide accessible names, summaries, and a non-visual data representation where appropriate.
- Every workflow is keyboard-operable with logical focus order.
- Focus indicators remain visible on every theme and surface.
- Data series never depend on color alone.
- Layout remains usable at 200% browser zoom.
- Mobile touch targets are at least 44px; smaller visual icons receive expanded hit areas.

## Migration Strategy

Implement the system as a sequence of vertical slices:

1. Foundations: tokens, typography, shared controls, and global header.
2. Documentation template: introduction and one representative chart page.
3. Home: hero and code-to-preview workflow.
4. Component discovery index.
5. One representative dashboard example.
6. Migrate remaining chart pages and examples after the patterns are validated.

This order validates the shared system on both dense product UI and expressive brand surfaces before broad migration.

## Validation

- Compare desktop and mobile screenshots for home, docs, a component page, and one dashboard.
- Test keyboard navigation, visible focus, reduced motion, and 200% zoom.
- Run automated accessibility checks on representative routes.
- Run lint, typecheck, Jest, and the production build.
- Confirm every documented CLI command against a clean test workspace.
- Verify chart color distinctions with common color-vision-deficiency simulations.

## Success Criteria

- Home, docs, and examples are recognizably one product.
- A new developer can reach a working chart from the home page in five minutes or less.
- Component pages make preview, installation, usage, and API discoverable without backtracking.
- The interface uses fewer decorative cards, shadows, blurs, and gradients than the current implementation.
- Mario Charts is differentiated by chart craft and developer workflow, not a fixed accent color.
- Representative routes meet the accessibility and verification requirements above.

## Out of Scope

- Changing chart public APIs solely for visual consistency.
- Introducing authenticated product features or hosted dashboards.
- Replacing the existing copy-paste distribution model.
- Explicit game-themed visuals in primary product surfaces.
