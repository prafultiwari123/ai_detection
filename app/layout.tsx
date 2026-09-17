import type { Metadata } from 'next';
import { Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import Link from 'next/link';
import './globals.css';

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-detection-lac.vercel.app'),
  title: {
    default: 'AI Line Detector — Spot AI-Written Text Instantly',
    template: '%s | AI Line Detector',
  },
  description: 'Paste any passage and instantly see which lines read as AI-written vs human-written. Free, fast, line-by-line AI detection.',
  keywords: ['AI detector', 'AI text detector', 'ChatGPT detector', 'AI writing checker'],
  authors: [{ name: 'Your Name' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Line Detector — Spot AI-Written Text Instantly',
    description: 'Paste a passage and see which lines read as AI-written vs human-written.',
    url: 'https://ai-detection-lac.vercel.app',
    siteName: 'AI Line Detector',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Line Detector — Spot AI-Written Text Instantly',
    description: 'Paste a passage and see which lines read as AI-written vs human-written.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>
        {/* Site nav — appears on every page */}
        <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold">
            AI Line Detector
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>

        {children}

        {/* JSON-LD structured data */}
        <Script id="ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'AI Line Detector',
            description:
              'Paste a passage and see which lines read as AI-written vs human-written.',
            url: 'https://ai-detection-lac.vercel.app',
            applicationCategory: 'UtilitiesApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          })}
        </Script>

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CNGDMQ6GY2"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CNGDMQ6GY2');
          `}
        </Script>
        {/* Microsoft Clarity */}
<Script id="clarity-init" strategy="afterInteractive">
  {`
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "yjofzj7mcy");
  `}
</Script>
      </body>
    </html>
  );
}