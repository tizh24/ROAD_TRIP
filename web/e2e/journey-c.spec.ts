import { expect, test } from '@playwright/test';

const ownerState = process.env.E2E_OWNER_STORAGE_STATE;
const memberState = process.env.E2E_MEMBER_STORAGE_STATE;
const tripId = process.env.E2E_TRIP_ID;
const inviteeEmail = process.env.E2E_MEMBER_EMAIL;
const ready = Boolean(process.env.E2E_BASE_URL && ownerState && memberState && tripId && inviteeEmail);

test.describe('Journey C — controlled collaboration', () => {
  test.skip(!ready, 'Requires E2E_BASE_URL, E2E_TRIP_ID, E2E_MEMBER_EMAIL, and authenticated owner/member storage-state files.');

  test('owner invites, member views then edits, and revocation takes effect immediately', async ({ browser, baseURL }) => {
    test.setTimeout(120_000);
    const owner = await browser.newContext({ storageState: ownerState });
    const ownerPage = await owner.newPage();
    await ownerPage.goto(`/trips/${tripId}`);
    await ownerPage.getByLabel('Email người được mời').fill(inviteeEmail!);
    await ownerPage.getByRole('button', { name: 'Mời' }).click();
    const invitation = ownerPage.getByRole('status').getByRole('link', { name: 'mở liên kết mời' });
    await expect(invitation).toBeVisible();
    const invitationUrl = await invitation.getAttribute('href');
    expect(invitationUrl).toBeTruthy();

    const member = await browser.newContext({ storageState: memberState });
    const memberPage = await member.newPage();
    await memberPage.goto(new URL(invitationUrl!, baseURL).pathname);
    await memberPage.getByRole('button', { name: 'Chấp nhận' }).click();
    await expect(memberPage.getByText('Trạng thái: ACCEPTED')).toBeVisible();
    await memberPage.goto(`/trips/${tripId}`);
    await expect(memberPage.getByText('Thành viên chỉ xem')).toBeVisible();
    await expect(memberPage.getByRole('combobox', { name: 'Thêm điểm dừng' })).toHaveCount(0);
    await expect(memberPage.getByRole('heading', { name: 'Cộng tác viên' })).toHaveCount(0);
    await expect(memberPage.getByLabel('Ghi chú')).toHaveCount(0);

    await ownerPage.reload();
    const memberRow = ownerPage
      .getByRole('list', { name: 'Thành viên chuyến đi' })
      .getByRole('listitem')
      .filter({ has: ownerPage.getByText('Thành viên', { exact: true }) });
    await expect(memberRow).toHaveCount(1);
    const permissionResponse = ownerPage.waitForResponse((response) => response.request().method() === 'PATCH' && /\/api\/v1\/trips\/[^/]+\/members\/[^/]+$/.test(response.url()));
    await memberRow.getByRole('combobox').selectOption('EDIT');
    expect((await permissionResponse).ok()).toBe(true);
    await memberPage.reload();
    await expect(memberPage.getByText('Thành viên có thể chỉnh sửa')).toBeVisible();
    await expect(memberPage.getByRole('combobox', { name: 'Thêm điểm dừng' })).toBeVisible();
    await expect(memberPage.getByRole('heading', { name: 'Cộng tác viên' })).toHaveCount(0);

    const stops = memberPage.locator('ol > li');
    await expect(stops).toHaveCount(2);
    const firstName = (await stops.nth(0).locator('strong').textContent())?.trim();
    const secondName = (await stops.nth(1).locator('strong').textContent())?.trim();
    expect(firstName).toBeTruthy();
    expect(secondName).toBeTruthy();
    const reorderResponse = memberPage.waitForResponse((response) => response.request().method() === 'PUT' && /\/api\/v1\/trips\/[^/]+\/days\/[^/]+\/stops\/order$/.test(response.url()));
    await memberPage.getByRole('button', { name: `Đưa ${secondName} lên` }).click();
    expect((await reorderResponse).ok()).toBe(true);
    await expect(stops.nth(0).locator('strong')).toHaveText(secondName!);
    await memberPage.reload();
    await expect(stops.nth(0).locator('strong')).toHaveText(secondName!);

    const removalResponse = ownerPage.waitForResponse((response) => response.request().method() === 'DELETE' && /\/api\/v1\/trips\/[^/]+\/members\/[^/]+$/.test(response.url()));
    await memberRow.getByRole('button', { name: 'Gỡ' }).click();
    expect((await removalResponse).ok()).toBe(true);
    await memberPage.reload();
    await expect(memberPage.getByText('Bạn không có quyền truy cập')).toBeVisible();
    await owner.close();
    await member.close();
  });
});
