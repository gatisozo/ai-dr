import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from './components/CookieBanner';
import GASnippet from './components/GASnippet';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai.lucera.site"),

  title: {
    default: "AI Visibility Checker klīnikām | Vai AI iesaka jūsu klīniku?",
    template: "%s | AI Visibility Checker",
  },

  description:
    "Pārbaudiet, vai ChatGPT, Claude un Perplexity iesaka jūsu klīniku pacientiem. Bezmaksas AI redzamības audits ar konkurentu salīdzinājumu 24h laikā.",

  alternates: {
    canonical: "https://ai.lucera.site/",
  },

  openGraph: {
    type: "website",
    url: "https://ai.lucera.site/",
    title: "Vai AI iesaka jūsu klīniku pacientiem?",
    description:
      "Pacienti arvien biežāk jautā AI, kuru klīniku izvēlēties. Uzziniet, vai jūsu klīnika ir redzama AI ieteikumos.",
    siteName: "AI Visibility Checker",
    locale: "lv_LV",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI redzamība klīnikām | AI Visibility Checker",
    description:
      "Uzziniet, ko ChatGPT, Claude un Perplexity saka par jūsu klīniku. Bezmaksas audits + 3 konkurentu salīdzinājums.",
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