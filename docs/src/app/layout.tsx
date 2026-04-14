import "@/app/global.css";
import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "Eesee Metrics - Privacy-First Web Analytics",
    template: "%s | Eesee Metrics",
  },
  description:
    "Privacy-first web analytics platform. Understand your website traffic without cookies, consent banners, or compromising user privacy.",
  keywords: [
    "web analytics",
    "privacy analytics",
    "Google Analytics alternative",
    "cookieless analytics",
    "website tracking",
    "GDPR compliant analytics",
  ],
  authors: [{ name: "Eesee Metrics" }],
  creator: "Eesee Metrics",
  publisher: "Eesee Metrics",
  metadataBase: new URL("https://eeseemetrics.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eeseemetrics.com",
    siteName: "Eesee Metrics",
    title: "Eesee Metrics - Privacy-First Web Analytics",
    description:
      "Privacy-first web analytics platform. Understand your website traffic without cookies or consent banners.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Eesee Metrics Analytics Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics - Privacy-First Web Analytics",
    description:
      "Privacy-first web analytics platform. Understand your website traffic without cookies or consent banners.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Eesee Metrics",
  "url": "https://eeseemetrics.com",
  "logo": "https://eeseemetrics.com/icon.svg",
  "email": "hello@eeseemetrics.com",
  "sameAs": [
    "https://github.com/velocidai/eeseemetrics"
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Eesee Metrics",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://eeseemetrics.com",
  "description": "Privacy-first web analytics with AI reports, anomaly detection, and MCP server support. Cookieless, GDPR-compliant, self-hostable.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "14.00",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "billingDuration": "P1M",
      },
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "19.00",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "billingDuration": "P1M",
      },
    },
    {
      "@type": "Offer",
      "name": "Scale",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "billingDuration": "P1M",
      },
    },
  ],
};

export default async function Layout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className={`flex flex-col min-h-screen ${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
