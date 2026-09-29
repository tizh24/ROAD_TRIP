import { createPublicOpenApiDocument } from './openapi';

describe('public OpenAPI document', () => {
  const document = createPublicOpenApiDocument();

  it('documents the versioned public API and its authentication policy', () => {
    expect(document.servers).toEqual([
      { url: '/api/v1', description: 'API Gateway v1' },
    ]);
    expect(document.components?.securitySchemes?.supabaseBearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
    expect(document.paths['/trips']?.post?.security).toEqual([
      { supabaseBearer: [] },
    ]);
  });

  it('documents retry and optimistic-concurrency headers without persistence models', () => {
    expect(document.components?.parameters).toHaveProperty('IdempotencyKey');
    expect(document.components?.parameters).toHaveProperty('IfMatch');
    expect(JSON.stringify(document)).toContain('TRIP_VERSION_CONFLICT');
    expect(JSON.stringify(document)).not.toContain('trip_schema');
    expect(JSON.stringify(document)).not.toContain('outbox_events');
  });
});
