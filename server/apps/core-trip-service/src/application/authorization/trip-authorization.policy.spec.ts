import {
  TripAuthorizationError,
  TripAuthorizationPolicy,
  type TripAccessReader,
} from './trip-authorization.policy';

class Reader implements TripAccessReader {
  constructor(
    private readonly record: Awaited<
      ReturnType<TripAccessReader['getAccessRecord']>
    >,
  ) {}
  getAccessRecord() {
    return Promise.resolve(this.record);
  }
}

describe('TripAuthorizationPolicy', () => {
  const ownerId = 'owner';
  const userId = 'user';

  it.each([
    ['owner', { tripExists: true, ownerId }, ownerId, true, false],
    [
      'editor',
      {
        tripExists: true,
        ownerId,
        membership: {
          role: 'MEMBER' as const,
          permission: 'EDIT' as const,
          status: 'ACTIVE' as const,
        },
      },
      userId,
      true,
      false,
    ],
    [
      'viewer',
      {
        tripExists: true,
        ownerId,
        membership: {
          role: 'MEMBER' as const,
          permission: 'VIEW' as const,
          status: 'ACTIVE' as const,
        },
      },
      userId,
      false,
      false,
    ],
    ['outsider', { tripExists: true, ownerId }, userId, false, true],
  ])(
    '%s follows the owner/editor/viewer/outsider matrix',
    async (_name, record, actor, canEdit, deniedRead) => {
      const policy = new TripAuthorizationPolicy(new Reader(record));
      if (deniedRead) {
        await expect(policy.assertCanRead('trip', actor)).rejects.toMatchObject(
          { code: 'FORBIDDEN' },
        );
        return;
      }
      await expect(policy.assertCanRead('trip', actor)).resolves.toBeDefined();
      if (canEdit)
        await expect(
          policy.assertCanEditItinerary('trip', actor),
        ).resolves.toBe(_name === 'owner' ? 'OWNER' : 'EDITOR');
      else
        await expect(
          policy.assertCanEditItinerary('trip', actor),
        ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    },
  );

  it('restricts trip and membership administration to the owner', async () => {
    const owner = new TripAuthorizationPolicy(
      new Reader({ tripExists: true, ownerId }),
    );
    await expect(owner.assertCanManageTrip('trip', ownerId)).resolves.toBe(
      'OWNER',
    );
    await expect(owner.assertCanManageMembers('trip', ownerId)).resolves.toBe(
      'OWNER',
    );
    const missing = new TripAuthorizationPolicy(
      new Reader({ tripExists: false, ownerId }),
    );
    await expect(missing.assertCanRead('trip', userId)).rejects.toBeInstanceOf(
      TripAuthorizationError,
    );
  });
});
