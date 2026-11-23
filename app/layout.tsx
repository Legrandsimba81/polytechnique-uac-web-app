import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const SITE_NAME = "Comité des Étudiants — Polytechnique";
const SITE_DESCRIPTION =
  "Site officiel du Comité des Étudiants de la Faculté de Polytechnique (Sciences et Technologies). Actualités, articles, gestion du comité et transparence financière.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: SITE_NAME,
    template: "%s | Comité Poly",
  },
  description: SITE_DESCRIPTION,

  applicationName: "Comité Poly",
  authors: [{ name: "Comité des Étudiants — Polytechnique", url: BASE_URL }],
  creator: "Comité des Étudiants — Polytechnique",
  publisher: "Comité des Étudiants — Polytechnique",
  category: "education",
  keywords: [
    "Polytechnique",
    "Comité des Étudiants",
    "Faculté de Polytechnique",
    "Sciences et Technologies",
    "étudiants",
    "université",
    "actualités étudiantes",
  ],

  alternates: {
    canonical: BASE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },

  manifest: "/manifest.webmanifest",

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-default.jpg"],
  },

  verification: {
    // À remplir après inscription dans Google Search Console
    // google: "ton-code-de-verification",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <OrganizationJsonLd />
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}