import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Health endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    Object.assign(process.env, {
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_JWKS_URL: 'http://localhost:54321/jwks',
      SUPABASE_JWT_ISSUER: 'http://localhost:54321/auth/v1',
      REDIS_URL: 'redis://localhost:6379',
      INTERNAL_SERVICE_TOKEN: 'test-internal-token-that-is-long-enough',
      VIETMAP_BASE_URL: 'https://maps.vietmap.vn',
      VIETMAP_API_KEY: 'test-key',
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
          service: 'geo-location-service',
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
          service: 'geo-location-service',
          checks: {},
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
