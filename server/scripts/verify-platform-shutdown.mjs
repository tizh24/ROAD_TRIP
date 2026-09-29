import { spawnSync } from 'node:child_process';

import {
  checkDurabilityJob,
  enqueueDurabilityJob,
} from './verify-redis-durability.mjs';

const project = process.env.COMPOSE_PROJECT_NAME ?? 'roadtrip-shutdown-smoke';
const composeFile = 'infrastructure/docker-compose.yml';
const activeServices = [
  'web',
  'api-gateway',
  'core-trip-service',
  'geo-location-service',
  'notification-worker',
  'redis',
];

function run(command, args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    stdio: capture ? 'pipe' : 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      `${command} ${args.join(' ')} failed (${result.status})\n${result.stderr ?? ''}`,
    );
  }
  return result.stdout?.trim() ?? '';
}

const compose = (...args) =>
  run('docker', ['compose', '-p', project, '-f', composeFile, ...args]);
const composeOutput = (...args) =>
  run('docker', ['compose', '-p', project, '-f', composeFile, ...args], {
    capture: true,
  });

function inspectExitCode(service) {
  const containerId = composeOutput('ps', '--all', '--quiet', service);
  if (!containerId) throw new Error(`Missing container for ${service}`);
  return Number(
    run('docker', ['inspect', '--format', '{{.State.ExitCode}}', containerId], {
      capture: true,
    }),
  );
}

async function assertPublicHealth() {
  const checks = [
    ['web', 'http://127.0.0.1:3000/health'],
    ['api-gateway', 'http://127.0.0.1:4100/health/ready'],
  ];
  for (const [name, url] of checks) {
    let lastError;
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(2_000),
        });
        if (response.ok) {
          lastError = undefined;
          break;
        }
        lastError = new Error(`${name} health returned ${response.status}`);
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    }
    if (lastError) {
      throw new Error(`${name} did not become reachable`, { cause: lastError });
    }
  }
}

let jobId;
try {
  const upArgs = ['up', '--detach', '--wait'];
  if (process.env.ROADTRIP_SHUTDOWN_SKIP_BUILD !== '1') {
    upArgs.push('--build');
  }
  compose(...upArgs);
  await assertPublicHealth();

  jobId = await enqueueDurabilityJob();
  compose('stop', '--timeout', '10', ...activeServices);

  const exitCodes = Object.fromEntries(
    activeServices.map((service) => [service, inspectExitCode(service)]),
  );
  const forcedKills = Object.entries(exitCodes).filter(
    ([, code]) => code === 137,
  );
  if (forcedKills.length > 0) {
    throw new Error(
      `SIGKILL required: ${forcedKills.map(([name]) => name).join(', ')}`,
    );
  }

  const stoppedLogs = composeOutput('logs', '--no-color');
  if (
    /unhandled(?:promise)?rejection|uncaught(?:exception| exception)/i.test(
      stoppedLogs,
    )
  ) {
    throw new Error('Unhandled runtime error found while stopping the stack');
  }

  compose('up', '--detach', '--wait');
  await assertPublicHealth();
  const jobState = await checkDurabilityJob(jobId);

  console.log(
    JSON.stringify({ status: 'pass', exitCodes, jobId, jobState }, null, 2),
  );
} finally {
  run(
    'docker',
    ['compose', '-p', project, '-f', composeFile, 'down', '--volumes'],
    { allowFailure: true },
  );
}
