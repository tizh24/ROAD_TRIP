import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const serverRoot = resolve(import.meta.dirname, '..');
const webRoot = resolve(serverRoot, '..', 'web');
const executable = (name) =>
  process.platform === 'win32' ? `${name}.cmd` : name;

const requiredEnvironment = [
  'TEST_DATABASE_URL',
  'E2E_BASE_URL',
  'E2E_OWNER_STORAGE_STATE',
  'E2E_MEMBER_STORAGE_STATE',
  'E2E_TRIP_ID',
  'E2E_MEMBER_EMAIL',
  'TEST_DATABASE_ISOLATED',
];

const missingEnvironment = requiredEnvironment.filter(
  (name) => !process.env[name],
);
const missingStateFiles = [
  'E2E_OWNER_STORAGE_STATE',
  'E2E_MEMBER_STORAGE_STATE',
]
  .filter(
    (name) =>
      process.env[name] && !existsSync(resolve(webRoot, process.env[name])),
  )
  .map((name) => `${name}=${process.env[name]}`);

if (missingEnvironment.length || missingStateFiles.length) {
  if (missingEnvironment.length)
    process.stderr.write(
      `Full E2E matrix requires: ${missingEnvironment.join(', ')}.\n`,
    );
  if (missingStateFiles.length)
    process.stderr.write(
      `Storage-state files do not exist: ${missingStateFiles.join(', ')}.\n`,
    );
  process.exit(2);
}

if (process.env.TEST_DATABASE_ISOLATED !== '1') {
  process.stderr.write(
    'Set TEST_DATABASE_ISOLATED=1 only for a dedicated disposable test database.\n',
  );
  process.exit(2);
}

let testDatabaseUrl;
try {
  testDatabaseUrl = new URL(process.env.TEST_DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(testDatabaseUrl.protocol))
    throw new Error('Unsupported database protocol.');
} catch {
  process.stderr.write('TEST_DATABASE_URL must be a PostgreSQL URL.\n');
  process.exit(2);
}

if (process.env.DATABASE_URL === process.env.TEST_DATABASE_URL) {
  process.stderr.write(
    'TEST_DATABASE_URL must differ from the application DATABASE_URL.\n',
  );
  process.exit(2);
}

const phases = [
  [
    'Backend unit, domain, authorization and contract',
    executable('pnpm'),
    ['test'],
    serverRoot,
  ],
  [
    'PostgreSQL repository integration',
    executable('pnpm'),
    ['test:integration'],
    serverRoot,
  ],
  [
    'Database constraint and RLS matrix',
    process.execPath,
    [
      resolve(serverRoot, 'node_modules/supabase/dist/supabase.js'),
      'test',
      'db',
      '--db-url',
      testDatabaseUrl.href,
    ],
    serverRoot,
  ],
  [
    'API Gateway E2E',
    executable('pnpm'),
    ['--filter', 'api-gateway', 'test:e2e'],
    serverRoot,
    5 * 60_000,
  ],
  [
    'Core Trip Service E2E',
    executable('pnpm'),
    ['--filter', 'core-trip-service', 'test:e2e'],
    serverRoot,
    5 * 60_000,
  ],
  [
    'Geo Location Service E2E',
    executable('pnpm'),
    ['--filter', 'geo-location-service', 'test:e2e'],
    serverRoot,
    5 * 60_000,
  ],
  [
    'Notification Worker E2E',
    executable('pnpm'),
    ['--filter', 'notification-worker', 'test:e2e'],
    serverRoot,
    5 * 60_000,
  ],
  [
    'Web auth, API contract and analytics',
    executable('npm'),
    ['test'],
    webRoot,
  ],
  [
    'Journey A/B/C and mandatory edge-case E2E',
    executable('npm'),
    ['run', 'test:e2e'],
    webRoot,
  ],
];

for (const [label, command, args, cwd, timeout] of phases) {
  process.stdout.write(`\n=== ${label} ===\n`);
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32' && command.endsWith('.cmd'),
    ...(timeout ? { timeout } : {}),
  });
  if (result.error) throw result.error;
  if (result.signal) {
    process.stderr.write(
      `${label} timed out after ${timeout / 60_000} minutes.\n`,
    );
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

process.stdout.write('\nFull automated test matrix passed.\n');
