# Cloud Config: Kubernetes on AWS for Bitartes Microfrontends

This document describes how to deploy the `home`, `docs`, and `tictactoe` microfrontends on AWS EKS using Kubernetes without Vercel. It mirrors the gateway behavior implemented by `nginx/default.conf` and keeps the microfrontends plugin working by preserving app paths and rewriting asset prefixes.

## Overview
- One Deployment + Service per app (`home`, `docs`, `tictactoe`), each listening on `3000`.
- A single Ingress acting as the gateway to route requests by path.
- Regex-based rewrite rules for microfrontend asset prefixes (`/vc-ap-bitartes-<app>` → `/_next/static/...`).
- Optional: Disable or gate Vercel Toolbar in production.

### Gateway rules to replicate
From `nginx/default.conf`:
- Route `/docs` and `/docs/*` to the `docs` app without rewriting the path.
- Route `/tictactoe` and `/tictactoe/*` to the `tictactoe` app without rewriting the path.
- Route all other traffic (`/`) to the `home` app.
- Rewrite asset prefixes:
  - `/vc-ap-bitartes-docs/(.*)` → `/$1` (proxy to `docs`)
  - `/vc-ap-bitartes-tictactoe/(.*)` → `/$1` (proxy to `tictactoe`)

## Prerequisites
- An EKS cluster and `kubectl` access.
- Nginx Ingress Controller installed (recommended) or ALB Ingress with a dedicated gateway pod (see below).
- Route 53 hosted zone and a domain, e.g. `mfe.example.com`.
- ACM certificate for TLS on `mfe.example.com` (via Ingress Controller or ALB).
- Container images for each app pushed to ECR.

## Build and Push Images (example)
Use the app Dockerfiles to build standalone Next outputs, tag, and push to ECR.

```bash
# Build images locally
# (adjust tags and ECR repo URIs to your account/region)

docker build -t <account>.dkr.ecr.<region>.amazonaws.com/bitartes-home:latest ./apps/home
docker build -t <account>.dkr.ecr.<region>.amazonaws.com/bitartes-docs:latest ./apps/docs
docker build -t <account>.dkr.ecr.<region>.amazonaws.com/bitartes-tictactoe:latest ./apps/tictactoe

# Authenticate and push
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

docker push <account>.dkr.ecr.<region>.amazonaws.com/bitartes-home:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/bitartes-docs:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/bitartes-tictactoe:latest
```

## Kubernetes Manifests
Create a namespace and deploy each app with a Service. The examples below show `home`; replicate for `docs` and `tictactoe` by changing names, labels, and images.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mfe
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: home
  namespace: mfe
spec:
  replicas: 2
  selector:
    matchLabels:
      app: home
  template:
    metadata:
      labels:
        app: home
    spec:
      containers:
      - name: home
        image: <account>.dkr.ecr.<region>.amazonaws.com/bitartes-home:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
      terminationGracePeriodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: home
  namespace: mfe
spec:
  type: ClusterIP
  selector:
    app: home
  ports:
  - name: http
    port: 3000
    targetPort: 3000
```

Repeat the same for `docs` and `tictactoe`:
- Change `name`, `labels`, and `image`.
- Readiness probes can use `GET /docs` and `GET /tictactoe` respectively.

## Ingress (Nginx Ingress Controller)
Create two Ingress resources—one for app routes (no rewrite) and one for asset-prefix rewrites.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mfe-web
  namespace: mfe
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - host: mfe.example.com
    http:
      paths:
      - path: /docs
        pathType: Prefix
        backend:
          service:
            name: docs
            port:
              number: 3000
      - path: /tictactoe
        pathType: Prefix
        backend:
          service:
            name: tictactoe
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: home
            port:
              number: 3000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mfe-assets
  namespace: mfe
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: "/$2"
spec:
  rules:
  - host: mfe.example.com
    http:
      paths:
      - path: /vc-ap-bitartes-docs(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: docs
            port:
              number: 3000
      - path: /vc-ap-bitartes-tictactoe(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: tictactoe
            port:
              number: 3000
      # Optional, if home uses a prefixed assets path
      - path: /vc-ap-bitartes-home(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: home
            port:
              number: 3000
```

### TLS
Add a `tls:` section referencing your certificate secret or let the Ingress Controller provision via annotations (e.g., cert-manager). Example:

```yaml
spec:
  tls:
  - hosts:
    - mfe.example.com
    secretName: mfe-tls
```

## ALB vs. Nginx
- ALB Ingress Controller does not support regex path rewrites. To use ALB only, deploy a lightweight gateway (Nginx/Envoy/Traefik) and route ALB traffic to it; configure rewrites there.
- Simplest path: use Nginx Ingress Controller as your public LB and replicate the existing `default.conf` behavior via Ingress annotations.

## Next.js App Config
- Keep `output: 'standalone'` in each app.
- Keep `withMicrofrontends(nextConfig, { debug: false })` for production.
- Gate Vercel Toolbar in production if desired:

```ts
// next.config.ts
import type { NextConfig } from 'next';
import { withMicrofrontends } from '@vercel/microfrontends/next/config';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

const nextConfig: NextConfig = { output: 'standalone' };
const applyToolbar = process.env.ENABLE_VERCEL_TOOLBAR === '1' ? withVercelToolbar() : (x: NextConfig) => x;
export default applyToolbar(withMicrofrontends(nextConfig, { debug: false }));
```

## Observability & Scaling
- Configure pod `resources` and an HPA per app based on CPU/Memory.
- Enable Ingress and pod logs; wire up CloudWatch or Prometheus/Grafana.
- Use readiness/liveness probes as shown to ensure stable rollouts.

## Checklist
- Images built and pushed to ECR.
- Namespace, Deployments, and Services applied for each app.
- Nginx Ingress installed and both Ingress manifests applied.
- DNS (`mfe.example.com`) pointing to the Ingress Controller LB.
- TLS certificates provisioned and configured.
- Vercel Toolbar disabled or gated in production if not needed.

## Notes
- `microfrontends.json` is used in development; production routing is provided by the Ingress rules.
- Asset prefix rewrites are essential for the microfrontends plugin to load `/_next/static` assets behind `/vc-ap-bitartes-<app>`.
- Keep apps on a single origin (same host) to enable cross-zone prefetch and seamless linking.