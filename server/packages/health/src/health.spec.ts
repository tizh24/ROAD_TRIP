import { HttpException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('health foundation', () => {
  it('keeps liveness independent from readiness dependencies', () => {
    const service = new HealthService({
      service: 'test-service',
      readinessChecks: [{ name: 'database', probe: () => false }],
    });

    expect(service.liveness()).toMatchObject({
      status: 'alive',
      service: 'test-service',
    });
  });

  it('reports every mandatory dependency as ready', async () => {
    const service = new HealthService({
      service: 'test-service',
      readinessChecks: [
        { name: 'database', probe: () => true },
        { name: 'redis', probe: async () => Promise.resolve(true) },
      ],
    });

    await expect(service.readiness()).resolves.toMatchObject({
      status: 'ready',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('maps unavailable and throwing dependencies to HTTP 503', async () => {
    const service = new HealthService({
      service: 'test-service',
      readinessChecks: [
        { name: 'database', probe: () => false },
        {
          name: 'redis',
          probe: () => {
            throw new Error('connection secret must not escape');
          },
        },
      ],
    });
    const controller = new HealthController(service);

    try {
      await controller.ready();
      throw new Error('Expected readiness to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const exception = error as HttpException;
      expect(exception.getStatus()).toBe(503);
      expect(exception.getResponse()).toMatchObject({
        status: 'not_ready',
        checks: { database: 'down', redis: 'down' },
      });
      expect(JSON.stringify(exception.getResponse())).not.toContain('secret');
    }
  });
});
