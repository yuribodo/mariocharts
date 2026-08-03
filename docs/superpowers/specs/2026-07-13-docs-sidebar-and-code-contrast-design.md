# Docs Sidebar and Code Contrast Design

## Scope

Fix two documentation-shell defects without changing navigation behavior, page content, or chart APIs:

1. Sidebar backgrounds ending before long pages end.
2. Low code-block separation and readability in the light theme.

## Full-Height Sidebars

- The outer left and right sidebar elements stretch across the complete documentation grid row.
- The outer elements own `bg-sidebar` and their dividing borders.
- A child wrapper owns `sticky`, `top-14`, viewport height, and vertical scrolling.
- Navigation and table-of-contents behavior remain unchanged.
- The background must cover the sidebar columns both before scrolling and throughout long pages.

## Adaptive Code Contrast

### Light Theme

- Code content uses `#f6f8fa`.
- The code header uses `#eef1f4`.
- Fallback text uses `#24292f`.
- Borders use a neutral color with clearer separation from the page background.
- Shiki continues using `github-light` syntax tokens.

### Dark Theme

- Code content remains Dracula `#282a36`.
- The code header remains `#21222c`.
- Borders remain `#44475a`.
- Shiki continues using `dracula` syntax tokens.

## Theme Changes

- Keep the currently highlighted HTML visible while the next theme is being generated.
- Associate highlighted HTML with the theme that produced it.
- Do not display `github-light` tokens on the Dracula surface or Dracula tokens on the light surface.
- The fallback remains readable if Shiki fails.

## Accessibility and Verification

- Copy controls preserve visible focus and accessible labels.
- Text readability does not depend on syntax color alone.
- Add structural tests for stretched sidebar wrappers and sticky children.
- Add CodeBlock tests for light theme selection, explicit light surfaces, and the existing dark theme behavior.
- Run focused Jest, TypeScript, scoped ESLint, and the complete Jest suite.
