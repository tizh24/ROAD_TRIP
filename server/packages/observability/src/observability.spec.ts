import { Writable } from 'node:stream';
import {
  correlationHeaders,
  getCorrelationId,
  normalizeCorrelationId,
  redact,
  runWithCorrelationId,
  StructuredLogger,
} from './index';

describe('observability', () => {
  it('redacts secrets, email and precise coordinates recursively', () => {
    const value = redact({
      authorization: 'Bearer jwt-value',
      user: { email: 'traveler@example.com' },
      location: { latitude: 10.762622, longitude: 106.660172 },
      safe: 'visible',
    });

    expect(value).toEqual({
      authorization: '[REDACTED]',
      user: { email: '[REDACTED]' },
      location: { latitude: '[REDACTED]', longitude: '[REDACTED]' },
      safe: 'visible',
    });
  });

  it('propagates correlation ID through asynchronous work and headers', async () => {
    await runWithCorrelationId('request-123', async () => {
      await Promise.resolve();
      expect(getCorrelationId()).toBe('request-123');
      expect(correlationHeaders({ accept: 'application/json' })).toEqual({
        accept: 'application/json',
        'x-correlation-id': 'request-123',
      });
    });
  });

  it('replaces invalid inbound correlation IDs', () => {
    expect(normalizeCorrelationId('invalid id with spaces')).not.toBe(
      'invalid id with spaces',
    );
  });

  it('writes redacted structured errors with correlation context', () => {
    let output = '';
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += String(chunk);
        callback();
      },
    });
    const logger = new StructuredLogger({
      service: 'test-service',
      environment: 'test',
      level: 'info',
      destination,
    });

    runWithCorrelationId('request-456', () =>
      logger.error(new Error('provider failed'), {
        inviteToken: 'raw-invite-token',
      }),
    );

    const entry = JSON.parse(output) as Record<string, unknown>;
    expect(entry.correlationId).toBe('request-456');
    expect(output).not.toContain('raw-invite-token');
    expect(output).toContain('[REDACTED]');
    expect(entry).toMatchObject({
      service: 'test-service',
      level: 50,
      msg: 'provider failed',
    });
  });
});
