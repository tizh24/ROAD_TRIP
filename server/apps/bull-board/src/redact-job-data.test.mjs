import assert from 'node:assert/strict';
import test from 'node:test';
import { redactJobData } from './redact-job-data.mjs';

test('allows operational metadata and removes sensitive event fields', () => {
  const result = redactJobData({
    eventId: 'event-1',
    eventType: 'trip.invitation.created.v1',
    eventVersion: 1,
    occurredAt: '2026-08-29T00:00:00.000Z',
    producer: 'core-trip-service',
    aggregateId: 'trip-1',
    correlationId: 'request-1',
    payload: { inviteeEmail: 'traveler@example.com', token: 'secret' },
  });

  assert.deepEqual(result, {
    eventId: 'event-1',
    eventType: 'trip.invitation.created.v1',
    eventVersion: 1,
    occurredAt: '2026-08-29T00:00:00.000Z',
    producer: 'core-trip-service',
    aggregateId: '[REDACTED]',
    correlationId: '[REDACTED]',
    payload: '[REDACTED]',
  });
  assert.equal(JSON.stringify(result).includes('traveler@example.com'), false);
  assert.equal(JSON.stringify(result).includes('secret'), false);
});
