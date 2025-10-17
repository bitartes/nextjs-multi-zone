#!/usr/bin/env node
/**
 * Kill processes listening on ports declared in apps/home/microfrontends.json
 * macOS-friendly implementation using `lsof`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const configPath = path.resolve(root, 'apps/home/microfrontends.json');

function readConfig(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read microfrontends.json at ${file}:`, err.message);
    process.exit(1);
  }
}

function collectPorts(cfg) {
  const apps = cfg?.applications ?? {};
  const ports = new Set();
  for (const [name, app] of Object.entries(apps)) {
    const port = app?.development?.local;
    if (typeof port === 'number' && Number.isFinite(port)) {
      ports.add(port);
    }
  }
  return Array.from(ports).sort((a, b) => a - b);
}

function pidsForPort(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (!out) return [];
    return out.split(/\s+/).filter(Boolean);
  } catch {
    return [];
  }
}

function killPids(pids, signal = '-TERM') {
  if (pids.length === 0) return false;
  try {
    execSync(`kill ${signal} ${pids.join(' ')}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensurePortFreed(port) {
  const pids = pidsForPort(port);
  if (pids.length === 0) {
    console.log(`• Port ${port} is free.`);
    return;
  }

  console.log(`• Port ${port} has ${pids.length} pid(s): ${pids.join(', ')}`);
  const termOk = killPids(pids, '-TERM');
  if (!termOk) {
    console.warn(`  - SIGTERM failed or not all pids terminated, escalating...`);
  }

  // Re-check and escalate to SIGKILL if needed
  const remaining = pidsForPort(port);
  if (remaining.length > 0) {
    const killOk = killPids(remaining, '-KILL');
    if (killOk) {
      console.log(`  - Killed stubborn pid(s) on ${port}: ${remaining.join(', ')}`);
    } else {
      console.error(`  - Failed to kill pid(s) on ${port}: ${remaining.join(', ')}`);
    }
  } else {
    console.log(`  - Terminated pid(s) on ${port}.`);
  }
}

function main() {
  const cfg = readConfig(configPath);
  const ports = collectPorts(cfg);
  if (ports.length === 0) {
    console.log('No development ports declared in microfrontends.json');
    return;
  }

  console.log(`Killing processes on ports: ${ports.join(', ')}`);
  for (const port of ports) {
    ensurePortFreed(port);
  }
  console.log('Done.');
}

main();