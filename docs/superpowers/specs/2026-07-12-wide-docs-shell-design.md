# Wide Documentation Shell Design

## Goal

Give interactive documentation surfaces more horizontal room while preserving comfortable reading width for prose.

## Desktop Layout

- Increase the three-column shell maximum width from `1440px` to `1600px`.
- Keep the left navigation at `240px` and the right table of contents at `220px`.
- Position both sidebars at the outer edges of the shell.
- Allow the central content wrapper to grow from `760px` to `960px`.
- Reduce extra-large main horizontal padding from `56px` to `40px`.
- Preserve the current sticky behavior, borders, and sidebar backgrounds.

## Content Width

- Interactive surfaces such as playgrounds, catalogs, code blocks, and API tables may use the full `960px` central width.
- Prose paragraphs and introductory copy retain their existing local `max-w-*` constraints.
- No global typography width is added because individual documentation pages already constrain long-form copy.

## Responsive Behavior

- Keep the existing two-column tablet layout unchanged.
- Keep the existing mobile drawer and table-of-contents affordance unchanged.
- Apply the expanded three-column shell only at the existing `xl` breakpoint.

## Verification

- Add a structural test for the `1600px` shell and `960px` central wrapper.
- Run focused Jest, TypeScript, scoped ESLint, and the complete Jest suite.
- Verify `/docs/components/bar-chart` responds with HTTP 200.
