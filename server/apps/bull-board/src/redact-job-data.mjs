const visibleKeys = [
  'eventId',
  'eventType',
  'eventVersion',
  'occurredAt',
  'producer',
];

export function redactJobData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { payload: '[REDACTED]' };
  }

  const redacted = {};
  for (const key of visibleKeys) {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') {
      redacted[key] = value;
    }
  }
  return {
    ...redacted,
    aggregateId: '[REDACTED]',
    correlationId: '[REDACTED]',
    payload: '[REDACTED]',
  };
}
