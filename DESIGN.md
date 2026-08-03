# Mario Charts Design System

## Visual Theme

Mario Charts is precise, refined, and technical. The interface uses quiet neutral
surfaces and lets charts, code, and interaction demonstrate the product. Geist
provides structural discipline and Resend provides a developer-first atmosphere;
neither is copied literally. The existing Mario Charts logo remains unchanged.

## Color

Semantic UI colors live in `app/globals.css` as OKLCH custom properties. Light
mode uses warm near-white surfaces; dark mode uses warm charcoal surfaces. Pure
white and black are avoided.

The data palette contains six roles: blue, green, amber, coral, violet, and cyan.
These colors are reserved for data series and semantic states. They are not page
decoration. Important distinctions also need labels, shapes, patterns, or line
styles so meaning never depends on color alone.

## Typography

- Geist Sans: headings, navigation, UI labels, and prose.
- Geist Mono: source code, CLI commands, identifiers, and technical metadata.
- Tabular figures: metrics, timestamps, axes, and aligned numeric comparisons.
- Prose measure: 65-75 characters.
- Large display type is reserved for the landing hero.

## Shape

Controls and framed tools use radii between 4px and 8px. Connected regions use
one-pixel dividers instead of separate floating cards. Pills are reserved for
tags, filters, and status values whose shape communicates their role.

## Elevation

Default surfaces are flat. Shadows are reserved for real overlay relationships,
including menus, popovers, tooltips, and sticky elements passing over content.
Glassmorphism and decorative blur are not part of the default system.

## Motion

UI feedback runs between 150ms and 220ms with exponential ease-out curves.
Motion communicates state changes, chart transitions, or direct feedback. It
uses transforms and opacity rather than layout properties. Reduced-motion mode
removes non-essential animation without hiding content or controls.

## Charts

Charts share a grammar for axes, grid lines, legends, tooltips, labels, focus,
loading, empty, and error states. Code, controls, and rendered output should feel
like one connected surface. Chart-specific gradients are allowed only when they
encode data and retain sufficient contrast.

## Components

Interactive components define default, hover, focus, active, disabled, loading,
and error states when applicable. Focus indicators remain visible in both themes.
Buttons use concise verb-noun labels; icon-only controls require accessible names.

## Responsive Behavior

Responsive design is structural. Sidebars collapse into drawers, dashboards
recompose by analytical priority, and tables gain appropriate scrolling or
alternate views. Critical functionality is not removed on mobile. Touch targets
are at least 44px while compact visual targets may sit inside expanded hit areas.

## Accessibility

The target is WCAG 2.1 AA. All workflows support keyboard operation, visible
focus, reduced motion, and browser zoom to 200%. Charts receive accessible names,
summaries, and non-visual data representations where appropriate. Mobile inputs
remain at least 16px to prevent unintended browser zoom.
