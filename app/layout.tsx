import type { Metadata } from 'next';
import { Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
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
  title: 'AI Line Detector',
  description: 'Paste a passage and see which lines read as AI-written vs human-written.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body className="bg-[#0f1115] font-serif text-stone-100 antialiased">{children}</body>
    </html>
  );
}
