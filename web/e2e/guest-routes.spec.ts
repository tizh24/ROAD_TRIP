import { expect, test } from '@playwright/test';

const protectedPaths = [
  '/trips',
  '/trips/new',
  '/trips/00000000-0000-4000-8000-000000000001?day=2',
  '/trip-invitations/example-token',
] as const;

test.describe('guest access to protected trip routes', () => {
  test.skip(!process.env.E2E_BASE_URL, 'Requires E2E_BASE_URL.');

  for (const path of protectedPaths) {
    test(`redirects ${path} to login and preserves the return path`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === '/login' && url.searchParams.get('next') === path,
      );
      await expect(page.getByLabel('Email')).toBeVisible();
    });
  }
});
