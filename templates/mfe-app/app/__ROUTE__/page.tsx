// @ts-nocheck
/* eslint-disable */
import { Link } from '@vercel/microfrontends/next/client';

export default function ZonePage() {
  return (
    <div className="min-h-screen px-8 py-16">
      <h1 className="text-4xl font-semibold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
        Zone: __APP_SLUG__
      </h1>
      <p className="mt-3 text-muted-foreground">
        This is the root page for the <code>/__ROUTE__</code> microfrontend.
      </p>
      <div className="mt-6">
        <Link className="text-primary hover:opacity-80" href="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}