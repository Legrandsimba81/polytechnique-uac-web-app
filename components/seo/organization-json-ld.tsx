export function OrganizationJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Comité des Étudiants — Faculté de Polytechnique",
    alternateName: "Comité Poly",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Comité représentatif des étudiants de la Faculté de Polytechnique (Sciences et Technologies).",
    sameAs: [
      // Ajoute ici les URLs officielles quand tu les as :
      // "https://www.facebook.com/ton-comite",
      // "https://www.instagram.com/ton-comite",
      // "https://x.com/ton-comite",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "contact@polytechnique.cd", // ← à adapter
        availableLanguage: ["fr", "en"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}