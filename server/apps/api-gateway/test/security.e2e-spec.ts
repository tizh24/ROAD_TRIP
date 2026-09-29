import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { loadGatewayConfig } from '@roadtrip/config';
import { getCorrelationId } from '@roadtrip/observability';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureGatewaySecurity } from '../src/gateway-security';
import { RATE_LIMIT_STORE } from '../src/security/rate-limit.types';
import { FakeRateLimitStore } from './fake-rate-limit.store';
import { setGatewayTestEnv } from './test-env';

@Controller('api/v1/security-probe')
class SecurityProbeController {
  @Get()
  get() {
    return { correlationId: getCorrelationId() };
  }

  @Post()
  post(@Body() body: unknown) {
    return { body, correlationId: getCorrelationId() };
  }
}

describe('Gateway security middleware (e2e)', () => {
  let app: INestApplication<App>;
  const rateLimitStore = new FakeRateLimitStore();

  beforeAll(async () => {
    setGatewayTestEnv({
      RATE_LIMIT_MAX: '2',
      REQUEST_BODY_LIMIT_BYTES: '64',
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SecurityProbeController],
      imports: [AppModule],
    })
      .overrideProvider(RATE_LIMIT_STORE)
      .useValue(rateLimitStore)
      .compile();
    const expressApp =
      moduleFixture.createNestApplication<NestExpressApplication>({
        bodyParser: false,
      });
    expressApp.useLogger(false);
    configureGatewaySecurity(expressApp, loadGatewayConfig());
    await expressApp.init();
    app = expressApp;
  });

  beforeEach(() => rateLimitStore.reset());

  afterAll(() => app.close());

  it('sets Helmet headers and only allows configured CORS origins', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .set('origin', 'http://localhost:3000')
      .set('x-correlation-id', 'security-allowed')
      .expect(200);

    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(allowed.headers['x-content-type-options']).toBe('nosniff');
    expect(allowed.headers['x-correlation-id']).toBe('security-allowed');

    const denied = await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .set('origin', 'https://untrusted.example')
      .expect(200);
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('replaces an invalid correlation ID and keeps it in request context', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .set('x-correlation-id', 'invalid correlation id')
      .expect(200);

    expect(response.headers['x-correlation-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(response.body).toEqual({
      correlationId: response.headers['x-correlation-id'],
    });
  });

  it('rejects request bodies over the configured limit', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/security-probe')
      .set('x-correlation-id', 'security-large-body')
      .send({ value: 'x'.repeat(128) })
      .expect(413)
      .expect('x-correlation-id', 'security-large-body')
      .expect({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request body is too large.',
        },
        meta: { correlationId: 'security-large-body' },
      });
  });

  it('returns a stable 429 response after the public route limit', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .expect(200);
    const response = await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .set('x-correlation-id', 'security-rate-limited')
      .expect(429);

    expect(response.headers['ratelimit-limit']).toBe('2');
    expect(response.headers['ratelimit-remaining']).toBe('0');
    expect(response.headers['retry-after']).toBe('60');
    expect(response.body).toEqual({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Try again later.',
      },
      meta: { correlationId: 'security-rate-limited' },
    });
  });

  it('fails open without exposing request data when Redis is unavailable', async () => {
    rateLimitStore.failure = new Error('redis unavailable');

    await request(app.getHttpServer())
      .get('/api/v1/security-probe')
      .set('authorization', 'Bearer must-not-be-logged')
      .expect(200);
  });
});
