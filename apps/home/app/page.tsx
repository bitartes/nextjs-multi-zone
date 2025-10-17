import Image from 'next/image';
import { Link } from '@vercel/microfrontends/next/client';
import { Button } from '@/components/ui/button';
import mfeIcon from '../public/mfe-icon-dark.png';
import mfConfig from '../microfrontends.json';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-6 py-24">
        <AppsSection />
      </main>
    </div>
  );
}

function AppsSection() {
  type ZoneEntry = { id: string; label: string; href: string };

  const apps: Record<string, any> = (mfConfig as any).applications ?? {};
  const entries: ZoneEntry[] = Object.entries(apps)
    .filter(([id]) => id !== 'bitartes-home')
    .map(([id, cfg]: [string, any]) => {
      const group: string | undefined = cfg?.routing?.[0]?.group;
      const firstPath: string | undefined = cfg?.routing?.[0]?.paths?.[0];
      const slugFromId = id.startsWith('bitartes-') ? id.replace('bitartes-', '') : id;
      const basePath = firstPath && firstPath.startsWith('/') ? firstPath : `/${slugFromId}`;
      const label = (group ?? slugFromId).replace(/-/g, ' ');
      return { id, label: capitalize(label), href: basePath };
    })
    .filter((e) => hasAccess(e.id));

  if (!entries.length) return null;

  return (
    <section>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((app) => (
          <Link key={app.id} href={app.href} className="block group">
            <div className="relative rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/7 hover:ring-[hsla(var(--accent)/0.6)]">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-[hsla(var(--accent)/0.12)] via-transparent to-[hsla(var(--secondary)/0.12)]" />
              <div className="relative p-6">
                <h3 className="text-lg font-semibold">{app.label}</h3>
                <p className="text-sm text-muted-foreground">{app.href}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function hasAccess(_appId: string): boolean {
  return true;
}

function capitalize(s: string): string {
  return s
    .split(' ')
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function FeaturesSection() {
  const features = [
    {
      title: 'Independent Deployment',
      description:
        'Deploy each microfrontend separately for faster iterations.',
    },
    {
      title: 'Technology Agnostic',
      description:
        'Use different frameworks or libraries for each microfrontend.',
    },
    {
      title: 'Scalable Teams',
      description:
        'Enable multiple teams to work on different parts of the application simultaneously.',
    },
    {
      title: 'Improved Performance',
      description:
        'Load only the necessary parts of your application for better performance.',
    },
  ];

  return (
    <section className="py-20" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div className="bg-white shadow rounded-lg p-6" key={feature.title}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join the microfrontend revolution today and build better web
          applications.
        </p>
        <Button size="lg" variant="secondary">
          Start Free Trial
        </Button>
      </div>
    </section>
  );
}
