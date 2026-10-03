import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Read-only deployment checks. Authenticated Journey A/B/C are a separate gate.
const web = publicUrl('E2E_BASE_URL');
const api = publicUrl('NEXT_PUBLIC_API_URL');
assert.equal(api.pathname.replace(/\/$/, ''), '/api/v1', 'API URL must end in /api/v1');
const correlationId = `t063-${randomUUID()}`;

async function request(url, options = {}) {
  return fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(20_000) });
}

for (const path of ['/', '/health', '/login']) {
  const response = await request(new URL(path, web));
  assert.equal(response.status, 200, `Web ${path}`);
  console.log(`PASS web ${path}`);
}
const protectedResponse = await request(new URL('/trips', web));
assert.ok([302, 303, 307, 308].includes(protectedResponse.status), 'Guest trips must redirect');
const location = new URL(protectedResponse.headers.get('location'), web);
assert.equal(location.origin, web.origin);
assert.equal(location.pathname, '/login');
console.log('PASS guest route protection');

const health = await request(new URL('/health/ready', api));
assert.equal(health.status, 200, 'Gateway readiness');
const trips = new URL(`${api.pathname.replace(/\/$/, '')}/trips`, api);
const unauthorized = await request(trips, { headers: { 'X-Correlation-ID': correlationId } });
assert.equal(unauthorized.status, 401);
assert.equal(unauthorized.headers.get('x-correlation-id'), correlationId);
const body = await unauthorized.json();
assert.equal(body.error?.code, 'AUTH_REQUIRED');
assert.equal(body.meta?.correlationId, correlationId);
console.log('PASS Gateway readiness, authentication guard and correlation ID');

for (const [origin, allowed] of [[web.origin, true], ['https://t063-untrusted.invalid', false]]) {
  const preflight = await request(trips, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type,idempotency-key,x-correlation-id',
    },
  });
  if (allowed) {
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    const headers = preflight.headers.get('access-control-allow-headers')?.toLowerCase() ?? '';
    for (const header of ['authorization', 'content-type', 'idempotency-key', 'x-correlation-id']) {
      assert.ok(headers.split(',').map(value => value.trim()).includes(header), `CORS header ${header}`);
    }
  } else {
    assert.equal(preflight.headers.get('access-control-allow-origin'), null);
  }
}
console.log('PASS CORS allowlist');
console.log('Public smoke passed. Authenticated journeys, live provider verification and end-to-end event tracing remain separate acceptance gates.');

function publicUrl(name) {
  assert.ok(process.env[name], `Missing ${name}`);
  const url = new URL(process.env[name]);
  assert.equal(url.protocol, 'https:', `${name} must use HTTPS`);
  assert.ok(!url.username && !url.password && !url.search && !url.hash, `${name} must not contain credentials, query or fragment`);
  return url;
}
