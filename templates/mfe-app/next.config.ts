// @ts-nocheck
/* eslint-disable */
import type { NextConfig } from 'next';
import { withMicrofrontends } from '@vercel/microfrontends/next/config';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default withVercelToolbar()(withMicrofrontends(nextConfig, { debug: true }));