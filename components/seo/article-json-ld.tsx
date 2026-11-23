type ArticleJsonLdProps = {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  section?: string;
  keywords?: string[];
};

export function ArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  section,
  keywords,
}: ArticleJsonLdProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || undefined,
    image: imageUrl
      ? imageUrl.startsWith("http")
        ? imageUrl
        : `${baseUrl}${imageUrl}`
      : undefined,
    datePublished: datePublished || undefined,
    dateModified: dateModified,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Comité des Étudiants — Faculté de Polytechnique",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: section,
    keywords: keywords?.length ? keywords.join(", ") : undefined,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}