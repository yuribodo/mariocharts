interface OrganizationSchemaProps {
  readonly name?: string;
  readonly url?: string;
  readonly logo?: string;
  readonly description?: string;
}

export function OrganizationSchema({
  name = "Mario Charts",
  url = "https://mario-charts.dev",
  logo = "https://mario-charts.dev/mario-charts-logo-peak.svg",
  description = "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: ["https://github.com/yuribodo/mariocharts"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareSourceCodeSchemaProps {
  readonly name?: string;
  readonly description?: string;
  readonly url?: string;
  readonly codeRepository?: string;
  readonly programmingLanguage?: string;
  readonly runtimePlatform?: string;
}

export function SoftwareSourceCodeSchema({
  name = "Mario Charts",
  description = "A modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box. Zero lock-in, copy-paste components.",
  url = "https://mario-charts.dev",
  codeRepository = "https://github.com/yuribodo/mariocharts",
  programmingLanguage = "TypeScript",
  runtimePlatform = "Node.js",
}: SoftwareSourceCodeSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    description,
    url,
    codeRepository,
    programmingLanguage,
    runtimePlatform,
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Organization",
      name: "Mario Charts",
      url: "https://mario-charts.dev",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

interface FAQSchemaProps {
  readonly items: readonly FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  readonly name: string;
  readonly url: string;
}

interface BreadcrumbSchemaProps {
  readonly items: readonly BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebSiteSchemaProps {
  readonly name?: string;
  readonly url?: string;
  readonly description?: string;
}

export function WebSiteSchema({
  name = "Mario Charts",
  url = "https://mario-charts.dev",
  description = "Modern React component library focused on charts and dashboards with beautiful visuals out-of-the-box.",
}: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/docs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
