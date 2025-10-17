// @ts-nocheck
/* eslint-disable */
import {
  PrefetchCrossZoneLinks,
  PrefetchCrossZoneLinksProvider,
} from '@vercel/microfrontends/next/client';
import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata = {
  title: 'Bitartes Microfrontends - tictactoe',
  description: 'Minimalist microfrontend zone: tictactoe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <PrefetchCrossZoneLinksProvider>{children}</PrefetchCrossZoneLinksProvider>
        <PrefetchCrossZoneLinks />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}