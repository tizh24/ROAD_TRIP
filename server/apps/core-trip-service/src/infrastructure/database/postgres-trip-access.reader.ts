import type { QueryExecutor } from '@roadtrip/db-client';
import type {
  TripAccessReader,
  TripAccessRecord,
} from '../../application/authorization/trip-authorization.policy';

export class PostgresTripAccessReader implements TripAccessReader {
  constructor(private readonly database: QueryExecutor) {}

  async getAccessRecord(
    tripId: string,
    userId: string,
  ): Promise<TripAccessRecord> {
    const result = await this.database.query<{
      ownerId: string;
      role: 'OWNER' | 'MEMBER' | null;
      permission: 'VIEW' | 'EDIT' | null;
      status: 'ACTIVE' | 'LEFT' | 'REMOVED' | null;
    }>(
      `SELECT t.owner_id AS "ownerId", m.role, m.permission, m.status
         FROM trip_schema.trips t
         LEFT JOIN trip_schema.trip_members m ON m.trip_id=t.id AND m.user_id=$2
        WHERE t.id=$1 AND t.deleted_at IS NULL`,
      [tripId, userId],
    );
    const row = result.rows[0];
    if (!row) return { tripExists: false, ownerId: '' };
    return {
      tripExists: true,
      ownerId: row.ownerId,
      ...(row.role && row.permission && row.status
        ? {
            membership: {
              role: row.role,
              permission: row.permission,
              status: row.status,
            },
          }
        : {}),
    };
  }
}
