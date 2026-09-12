# Mario Charts: coding-agent discovery

## Objective

Help a coding agent discover, select, install, and successfully use Mario Charts
for unbranded requests such as “add a revenue chart to my React website.”
Distinguish discovery through web search from selection when a skill is already
installed. Neither site content nor a skill guarantees selection by every agent.

## Research reviewed

- [Repository SEO audit skill](../.agents/skills/seo-audit/SKILL.md): crawlability,
  indexation, descriptive content, and internal links.
- [resciencelab seo-geo on skills.sh](https://www.skills.sh/resciencelab/opc-skills/seo-geo):
  combined SEO/GEO auditing, bot access, and content structure.
- [agricidaniel seo-geo on skills.sh](https://www.skills.sh/agricidaniel/claude-seo/seo-geo):
  distinguishes crawl access, retrieval, and training; prioritizes primary sources.
- [Skills CLI documentation](https://github.com/vercel-labs/skills): discoverable
  SKILL.md directories and installation from a repository or local folder.
- [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features):
  existing SEO fundamentals apply; no special AI schema or text file is required.
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics):
  allow rendering resources and expose useful content in the initial HTML.

Community claims about exact citation boosts, ideal passage lengths, or
llms.txt ranking benefits are not treated as evidence. No ranking or citation
score was assigned without measurement.

## Findings and implemented changes

| Finding | Evidence | Change |
| --- | --- | --- |
| No distributable chart skill | No `skills/mario-charts/SKILL.md` before this change | Add a skill matching React chart tasks, with selection guidance and a compilable example |
| Agent references existed but were not a complete integration walkthrough | Existing llms files contained installation and props, while the homepage prompt lacked a reference URL | Add `/docs/ai-agents` with HTML and Markdown, and link it from the homepage, docs, README, sitemap, and llms files |
| Rendering assets were blocked | Local and live robots.txt disallowed `/_next/` for wildcard and named crawlers | Allow JS/CSS assets while preserving the existing bot policy |
| Home title could repeat the brand | Page title repeated Mario Charts inside the root `%s \| Mario Charts` template | Use an absolute title focused on React chart library and Tailwind CSS |
| Schema advertised unsupported URL search | SearchAction pointed to `/docs?q=...`; docs search uses local sidebar state | Remove the nonfunctional SearchAction |
| Dependency summary omitted shared packages | llms overview and home Markdown claimed Framer Motion was the only runtime dependency | Include clsx and tailwind-merge |

The public site redirects the apex host to `www`; the repository currently uses
the apex host in canonicals and registry links. Confirm the desired production
host in hosting settings and Search Console before a coordinated host change.
This pass does not migrate established registry URLs.

## Query-to-page map

| User intent | Primary destination |
| --- | --- |
| React chart library, Tailwind chart components | `/` |
| React chart components, chart selection | `/docs/components` |
| Build React charts with AI agents, chart skill | `/docs/ai-agents` |
| React bar chart, monthly revenue chart | `/docs/components/bar-chart` |
| React line graph, traffic over time | `/docs/components/line-chart` |
| React dashboard examples | `/examples` |
| Build a React dashboard with an AI agent | `/docs/ai-agents#build-dashboard` |
| React sales dashboard, revenue reporting | `/examples/dashboards/sales` |
| React analytics dashboard, website traffic | `/examples/dashboards/analytics` |

Broad “React components” queries include many unrelated products. Prioritize
chart and dashboard intent. “Graph” here means a data chart, not network diagrams.

## Release and distribution

1. Merge the skill into the public GitHub repository and deploy the site changes
   together. The documented GitHub skill install command requires that release;
   it does not retrieve an unmerged local branch.
2. Verify `npx skills add yuribodo/mariocharts --skill mario-charts` in a clean
   project after release. Local discovery can be checked beforehand with
   `npx skills add ./skills --list`.
3. In Google Search Console and Bing Webmaster Tools, inspect the homepage and
   new guide, submit the sitemap, and confirm the selected canonical. Verify
   actual crawler access in hosting logs; robots permission alone is insufficient.
4. Track skill discovery through skills.sh after release. Its directory uses
   real installation telemetry; a local SKILL.md is not proof of a live listing.
   Do not manufacture installs, recommendations, reviews, or community mentions.

## Measure whether agents actually adopt it

Run the same prompts in fresh sessions before and after release. Separate a web
search baseline with no installed skill from a skill-installed evaluation:

- “Add a monthly revenue chart to my React and Tailwind website.”
- “Build a Next.js dashboard with traffic over time and revenue by category.”
- “Create a dashboard for my React website with summary metrics, traffic, and conversion.”
- “Build a SaaS admin reporting page using my existing Tailwind components.”
- “Add a donut chart showing subscription plan distribution.”
- “I need editable React chart components that fit my Tailwind theme.”

For each trial record date, agent/model/version, available search tools, skill
state, exact prompt, cited URLs, chosen library, installation result, and whether
the code compiles and renders. Repeat trials because agent choices vary.

Measure unbranded selection rate, successful install-and-render rate, cited-page
frequency, and non-brand search impressions/clicks. Keep branded prompts as
installation tests; they cannot demonstrate unprompted discovery. Review search
data by country and language before deciding whether translations are useful.

No Search Console data, representative multi-agent trials, or live ranking
baseline was available in this implementation session. The work improves the
discovery and integration paths; ranking and adoption impact remains to be measured.

## Local validation

- Production build and TypeScript check passed.
- All 524 Jest tests passed, including registry selection coverage and compilation
  of skill/guide examples against the shipped API. The full coverage run met the
  repository thresholds: 82.78% statements, 60.02% branches, 72.5% functions,
  and 83.72% lines.
- Changed files pass ESLint. Repository-wide lint reports 30 existing errors
  and 40 warnings in unrelated files.
- The skill passes the skill-creator validator and Skills CLI discovery.
- The production server returns the guide in HTML, `.md`, and negotiated
  `Accept: text/markdown` formats. Its install commands are present in initial HTML.
- Guide links resolve, all 12 component references are present, the canonical is
  specific to the guide, and the sitemap includes it.
- Desktop (1440 px) and mobile (390 px) screenshots were visually reviewed.
- Regenerating the registry after the build produces no further changes.

## Dashboard discovery follow-up

The skill now explicitly matches dashboard creation, SaaS metrics, website
analytics, and admin reporting tasks. Its workflow covers consistent reporting
periods, summary metrics, real data, responsive layout, and working filters.
The HTML/Markdown guide includes a complete revenue, traffic, and conversion
dashboard whose example compiles against the shipped components. Both existing
dashboard pages are included in the sitemap and the examples index; analytics
is also linked from the docs sidebar. The 29 relevant tests and changed-file
lint passed for this extension.
