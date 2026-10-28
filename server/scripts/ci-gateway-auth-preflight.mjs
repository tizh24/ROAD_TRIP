// Runs inside the api-gateway container (docker compose exec -T api-gateway node - < this file).
// Verifies, from the gateway's own network position and with its own credentials, the three
// Supabase dependencies behind AUTH_UNAVAILABLE: Auth health, the JWKS endpoint and the
// PostgREST profile table read. Prints status codes only, never key material.
const { SUPABASE_URL, SUPABASE_JWKS_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

const serviceHeaders = SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_secret_')
  ? { apikey: SUPABASE_SERVICE_ROLE_KEY }
  : { apikey: SUPABASE_SERVICE_ROLE_KEY ?? '', authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY ?? ''}` };

const checks = [
  {
    name: 'auth health',
    url: new URL('/auth/v1/health', SUPABASE_URL).href,
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY ?? '' },
  },
  { name: 'jwks', url: SUPABASE_JWKS_URL, headers: {} },
  {
    name: 'profile read (service key)',
    url: new URL('/rest/v1/user_profiles?select=id&limit=1', SUPABASE_URL).href,
    headers: serviceHeaders,
  },
];

if (!SUPABASE_URL || !SUPABASE_JWKS_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    `Gateway container is missing config: SUPABASE_URL=${Boolean(SUPABASE_URL)} SUPABASE_JWKS_URL=${Boolean(SUPABASE_JWKS_URL)} SUPABASE_SERVICE_ROLE_KEY=${Boolean(SUPABASE_SERVICE_ROLE_KEY)} (key prefix: ${(SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 9) || 'empty'})`,
  );
  process.exit(2);
}

let failed = false;
for (const check of checks) {
  let line;
  let ok = false;
  for (let attempt = 1; attempt <= 30 && !ok; attempt += 1) {
    try {
      const response = await fetch(check.url, { headers: check.headers, signal: AbortSignal.timeout(5000) });
      ok = response.ok;
      line = `${check.name}: HTTP ${response.status}${ok ? '' : ` ${(await response.text()).slice(0, 200)}`}`;
    } catch (error) {
      line = `${check.name}: request failed (${error.cause?.code ?? error.message}) for ${new URL(check.url).origin}`;
    }
    if (!ok) await new Promise((done) => setTimeout(done, 2000));
  }
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${line} (key prefix: ${(SUPABASE_SERVICE_ROLE_KEY).slice(0, 9)})`);
  failed ||= !ok;
}
process.exit(failed ? 1 : 0);
