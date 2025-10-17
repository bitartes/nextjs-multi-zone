import {
  PrefetchCrossZoneLinks,
  PrefetchCrossZoneLinksProvider,
} from '@vercel/microfrontends/next/client';
import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toolbar } from './client-scripts';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata = {
  title: 'Bitartes Microfrontends',
  description: 'Minimalist microfrontend hub.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <PrefetchCrossZoneLinksProvider>
          {children}
        </PrefetchCrossZoneLinksProvider>
        <PrefetchCrossZoneLinks />
        <SpeedInsights />
        <Analytics />
        <Toolbar />
      </body>
    </html>
  );
}
