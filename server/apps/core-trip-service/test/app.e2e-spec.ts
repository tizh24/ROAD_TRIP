import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DatabaseService } from './../src/infrastructure/database/database.service';
import { BullMqEventPublisher } from './../src/infrastructure/events/bullmq-event-publisher';

describe('Health endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_JWKS_URL: 'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
      SUPABASE_JWT_ISSUER: 'http://127.0.0.1:54321/auth/v1',
      SUPABASE_JWT_AUDIENCE: 'authenticated',
      REDIS_URL: 'redis://127.0.0.1:6379',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
      INTERNAL_SERVICE_TOKEN: 'test-internal-token-at-least-32-characters',
    });
    const database = {
      isReady: () => true,
      query: jest.fn().mockResolvedValue({ rows: [] }),
      transaction: jest.fn().mockResolvedValue([]),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(database)
      .overrideProvider(BullMqEventPublisher)
      .useValue({ publish: jest.fn(), onModuleDestroy: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'alive',
          service: 'core-trip-service',
        });
      });
  });

  it('/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ready',
          service: 'core-trip-service',
          checks: { database: 'up' },
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
