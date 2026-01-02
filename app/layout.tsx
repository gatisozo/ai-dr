import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import GASnippet from "./components/GASnippet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-dr.lucera.site"),

  title: {
    default: "Lucera — Personal AI Trust Check ārstam",
    template: "%s — Lucera",
  },

  description:
    "AI reputācijas audits ārstam: mini-check (5–10 sek.), reālais AI tests (10 sek.) un bezmaksas Personal AI Trust Check 1 darba dienā. Uzzini, vai AI spēj droši sasaistīt tavu vārdu ar specialitāti, metodēm un kompetenci pacienta jautājumos.",

  alternates: {
    canonical: "https://ai-dr.lucera.site/",
  },

  openGraph: {
    type: "website",
    url: "https://ai-dr.lucera.site/",
    title: "Lucera — Personal AI Trust Check ārstam",
    description:
      "Pacienti arvien biežāk jautā AI, pie kura ārsta pierakstīties. Pārbaudi realitāti ar mini-check un reālo AI testu, un saņem bezmaksas Trust Check 1 darba dienā.",
    siteName: "Lucera",
    locale: "lv_LV",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lucera — Personal AI Trust Check ārstam",
    description:
      "Mini-check (5–10 sek.), AI tests (10 sek.) un bezmaksas Trust Check 1 darba dienā. Saprotami iemesli + 30 dienu rīcības plāns.",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GASnippet />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
