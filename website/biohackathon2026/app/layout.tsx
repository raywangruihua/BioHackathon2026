import { Manrope, Newsreader } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import TopNav from '@/components/TopNav';
import PaletteProvider from '@/components/PaletteProvider';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pearl — PCOS care, made personal',
  description:
    'Pearl helps women understand the signs of PCOS, track symptoms over time, and connect with clinicians who listen.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${newsreader.variable}`}>
      <body>
        <PaletteProvider initial="rose">
          <TopNav />
          <main style={{ minHeight: 'calc(100vh - 80px)' }}>{children}</main>
        </PaletteProvider>
      </body>
    </html>
  );
}
