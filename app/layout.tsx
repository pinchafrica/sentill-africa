export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LiveTicker from "@/components/LiveTicker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InterceptorModal from "@/components/InterceptorModal";
import CortexButler from "@/components/CortexButler";
import SovereignTicker from "@/components/SovereignTicker";
import SovereignSeal from "@/components/SovereignSeal";
import GlobalOverlays from "@/components/GlobalOverlays";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import SentillOracle from "@/components/SentillOracle";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import WealthPredictorModal from "@/components/WealthPredictorModal";
import RiskProfilerModal from "@/components/RiskProfilerModal";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sentill.africa"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sentill",
  },
  title: {
    default: "Sentill Africa | S-Tier Institutional Wealth Intelligence",
    template: "%s | Sentill Africa",
  },
  description: "Navigate Kenya's sophisticated financial landscape with real-time AI yields, tax-alpha optimization, and institutional-grade oversight for SACCOs, MMFs, and NSE Equities.",
  keywords: ["Kenya Wealth Management", "NSE Market Terminal", "Sacco Data Kenya", "MMF Yields", "Tax Alpha", "Investment Analytics Africa", "Diaspora Investment Kenya", "Chama Dashboard"],
  authors: [{ name: "Sentill Africa Engineering" }],
  publisher: "Sentill Africa",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Sentill Africa | S-Tier Institutional Wealth Intelligence",
    description: "Benchmark your capital against Kenya's top-performing regulated assets with our AI-powered wealth terminal.",
    url: "https://sentill.africa",
    siteName: "Sentill Africa",
    locale: "en_KE",
    images: [{ 
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Sentill Africa Institutional Wealth Dashboard"
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentill Africa | Wealth Intelligence",
    description: "Institutional-grade oversight for SACCOs, MMFs, and Equities.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "sentill-google-search-console-verification-id",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sentill.africa/#website",
      "url": "https://sentill.africa/",
      "name": "Sentill Africa",
      "description": "Institutional Wealth Intelligence for Kenya",
      "publisher": {
        "@id": "https://sentill.africa/#organization"
      },
      "inLanguage": "en-KE"
    },
    {
      "@type": "FinancialService",
      "@id": "https://sentill.africa/#organization",
      "name": "Sentill Africa",
      "url": "https://sentill.africa",
      "logo": "https://sentill.africa/images/logo.jpg",
      "description": "Navigate Kenya's sophisticated financial landscape with real-time yields, tax-alpha optimization, and institutional-grade oversight.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE"
      },
      "areaServed": "Kenya",
      "sameAs": [
        "https://twitter.com/SentillAfrica",
        "https://linkedin.com/company/sentill"
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500/30 selection:text-emerald-900`}>
        {/* Google Analytics Tracking - G-RHE3JS0FYT */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-RHE3JS0FYT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RHE3JS0FYT');
          `}
        </Script>
        
        <SovereignSeal />
        <div className="flex flex-col min-h-screen">
          <SovereignTicker />
          <Navbar />
          <main className="flex-grow pt-44 relative">
            {children}
          </main>
          <Footer />
        </div>
        <CortexButler />
        <InterceptorModal />
        <GlobalOverlays />
        <WhatsAppFloating />
        <SentillOracle />
        <WealthPredictorModal />
        <RiskProfilerModal />
        <ServiceWorkerRegister />
        <Toaster position="top-center" expand={true} richColors closeButton />
      </body>
    </html>
  );
}
