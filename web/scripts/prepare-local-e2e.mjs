import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const webRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDir = resolve(webRoot, '.e2e');
const baseUrl = requiredUrl('E2E_BASE_URL');
const apiUrl = requiredUrl('NEXT_PUBLIC_API_URL');
const supabaseUrl = requiredUrl('NEXT_PUBLIC_SUPABASE_URL');
const publishableKey = required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
const secretKey = required('SUPABASE_LOCAL_SECRET_KEY');

for (const url of [baseUrl, apiUrl, supabaseUrl]) {
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Local E2E preparation accepts loopback URLs only.');
  }
}

const admin = createClient(supabaseUrl.href, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const publicClient = createClient(supabaseUrl.href, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
let browser;

try {
  await mkdir(outputDir, { recursive: true });
  const owner = await createUser('owner');
  const member = await createUser('member');
  browser = await chromium.launch(
    process.env.E2E_BROWSER_CHANNEL === 'msedge'
      ? { channel: 'msedge' }
      : {},
  );
  await saveStorageState(owner, 'owner.json');
  await saveStorageState(member, 'member.json');

  const { data, error } = await publicClient.auth.signInWithPassword({
    email: owner.email,
    password: owner.password,
  });
  if (error || !data.session) throw new Error('Owner API login failed.');
  const token = data.session.access_token;
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 30);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const trip = await gatewayPost('trips', token, {
    title: `E2E collaboration fixture ${randomUUID()}`,
    description: 'Local T060 fixture',
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    budgetAmount: 0,
    currency: 'VND',
  });
  const dayId = trip.days?.[0]?.id;
  if (!trip.id || !dayId) throw new Error('Trip fixture has no first day.');
  for (const place of [
    { placeId: 'e2e-hanoi', name: 'Hồ Hoàn Kiếm', address: 'Hà Nội', latitude: 21.0285, longitude: 105.8542 },
    { placeId: 'e2e-ninh-binh', name: 'Tràng An', address: 'Ninh Bình', latitude: 20.2506, longitude: 105.9745 },
  ]) {
    await gatewayPost(`trips/${trip.id}/days/${dayId}/stops`, token, place);
  }

  const fixture = {
    E2E_BASE_URL: baseUrl.href.replace(/\/$/, ''),
    E2E_OWNER_STORAGE_STATE: '.e2e/owner.json',
    E2E_MEMBER_STORAGE_STATE: '.e2e/member.json',
    E2E_TRIP_ID: trip.id,
    E2E_MEMBER_EMAIL: member.email,
  };
  await writeFile(resolve(outputDir, 'fixture.json'), JSON.stringify(fixture, null, 2));
  process.stdout.write('Local E2E fixture ready in web/.e2e/fixture.json.\n');
} finally {
  await browser?.close();
}

async function createUser(role) {
  const user = {
    email: `roadtrip-t060-${role}-${randomUUID()}@example.test`,
    password: `E2E-${randomUUID()}`,
  };
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: `E2E ${role}` },
  });
  if (error || !data.user) throw new Error(`Could not create local ${role} user: ${error?.message ?? 'missing response user'}`);
  return user;
}

async function saveStorageState(user, filename) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(new URL('/login', baseUrl).href);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Mật khẩu').fill(user.password);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 30_000 });
    await context.storageState({ path: resolve(outputDir, filename) });
  } finally {
    await context.close();
  }
}

async function gatewayPost(path, token, body) {
  const response = await fetch(new URL(`/api/v1/${path}`, apiUrl), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': randomUUID(),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Gateway fixture request failed: ${response.status} ${path}`);
  return (await response.json()).data;
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredUrl(name) {
  return new URL(required(name));
}
