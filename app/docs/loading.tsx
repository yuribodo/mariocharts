/**
 * Route loading state for everything under /docs.
 *
 * Chart pages are heavy client components (interactive playground + Shiki
 * code blocks + entrance animations), so navigating between them used to
 * feel "dry": the click gave zero feedback until the whole page mounted and
 * then it snapped in at once. Next renders this skeleton during the
 * transition, mirroring the chart-page shape (header, playground, code) so
 * the swap reads as a continuous morph instead of a hard cut.
 */
export default function DocsLoading() {
  return (
    <article className="space-y-16 pb-20" aria-busy="true" aria-label="Loading">
      <span className="sr-only" role="status">
        Loading chart documentation…
      </span>

      <header aria-hidden="true" className="border-b pb-10 pt-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded-md bg-muted" />
        <div className="mt-5 h-6 w-full max-w-2xl animate-pulse rounded bg-muted" />
        <div className="mt-2 h-6 w-2/3 max-w-xl animate-pulse rounded bg-muted" />
        <div className="mt-8 h-11 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </header>

      <section aria-hidden="true" className="space-y-5">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-muted" />
        <div className="grid min-h-[420px] overflow-hidden rounded-md border bg-card md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="hidden animate-pulse bg-muted/20 md:block" />
          <div className="grid place-items-center p-8">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-40 animate-pulse rounded-md bg-muted" />
      </section>
    </article>
  );
}
