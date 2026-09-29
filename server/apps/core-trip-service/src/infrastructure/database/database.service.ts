import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { loadCoreTripConfig } from '@roadtrip/config';
import { PostgresDatabase } from '@roadtrip/db-client';

@Injectable()
export class DatabaseService
  extends PostgresDatabase
  implements OnModuleDestroy
{
  constructor() {
    const config = loadCoreTripConfig();
    super({
      connectionString: config.DATABASE_URL,
      applicationName: 'core-trip-service',
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
