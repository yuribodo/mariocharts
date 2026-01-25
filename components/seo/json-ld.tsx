import { SITE_CONFIG } from "@/lib/constants";

interface OrganizationSchemaProps {
  readonly name?: string;
  readonly url?: string;
  readonly logo?: string;
  readonly description?: string;
}

export function OrganizationSchema({
  name = SITE_CONFIG.name,
  url = SITE_CONFIG.url,
  logo = `${SITE_CONFIG.url}/mario-charts-logo-peak.svg`,
  description = SITE_CONFIG.description,
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [SITE_CONFIG.github],
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
  name = SITE_CONFIG.name,
  description = `${SITE_CONFIG.description} Zero lock-in, copy-paste components.`,
  url = SITE_CONFIG.url,
  codeRepository = SITE_CONFIG.github,
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
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
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
  // Don't render if no items
  if (!items.length) return null;

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
  // Don't render if no items or only one item
  if (items.length < 2) return null;

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
  name = SITE_CONFIG.name,
  url = SITE_CONFIG.url,
  description = SITE_CONFIG.description,
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
