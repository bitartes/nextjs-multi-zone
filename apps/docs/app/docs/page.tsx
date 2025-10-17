import { Link } from '@vercel/microfrontends/next/client';
import { Button } from '@/components/ui/button';

const cards = [
  {
    title: 'Getting Started',
    body: 'Workspace setup, routing, and dev workflow.',
    href: '#getting-started',
  },
  {
    title: 'Examples',
    body: 'Sample zones showing cross-linking and asset isolation.',
    href: '#examples',
  },
  {
    title: 'Architecture',
    body: 'Composition, boundaries, and deployment considerations.',
    href: '#architecture',
  },
  {
    title: 'Tooling',
    body: 'Turbo, Tailwind, Vercel Toolbar, and diagnostics.',
    href: '#tooling',
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <main className="px-6 sm:px-8 py-16">
        <section className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
            Microfrontends Documentation
          </h1>
          <p className="mt-4 text-muted-foreground">
            Build independently, ship together. Patterns, guides, and examples for the Bitartes microfrontends workspace.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="#getting-started">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#examples">See Examples</Link>
            </Button>
            <Link className="text-primary hover:opacity-80 ml-2" href="/">
              Back to Home
            </Link>
          </div>
        </section>

        <section className="mt-14 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <div className="rounded-xl p-6 bg-card/40 backdrop-blur border border-[hsl(var(--border))] shadow-sm transition-all duration-300 group-hover:border-[hsl(var(--ring))] group-hover:shadow-[0_0_32px_hsla(var(--accent)/0.25)]">
                <h3 className="text-lg font-medium">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
                <span className="mt-4 inline-flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
