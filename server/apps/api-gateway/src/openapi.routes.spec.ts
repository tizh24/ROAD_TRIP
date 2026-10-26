import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { AdminController } from './auth/admin.controller';
import { AuthBffController } from './auth/auth-bff.controller';
import { AuthController } from './auth/auth.controller';
import { ProfileController } from './auth/profile.controller';
import { createPublicOpenApiDocument } from './openapi';
import { BillingWebhookController } from './upstream/billing-webhook.controller';
import { PublicTripController } from './upstream/public-trip.controller';

const document = createPublicOpenApiDocument();
const methodNames: Record<number, string> = {
  [RequestMethod.GET]: 'get',
  [RequestMethod.POST]: 'post',
  [RequestMethod.PUT]: 'put',
  [RequestMethod.PATCH]: 'patch',
  [RequestMethod.DELETE]: 'delete',
};

function routesOf(controller: new (...args: never[]) => unknown) {
  const base = Reflect.getMetadata(PATH_METADATA, controller) as string;
  const proto = controller.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(proto).flatMap((name) => {
    const handler = proto[name] as object;
    if (typeof handler !== 'function') return [];
    const method = Reflect.getMetadata(METHOD_METADATA, handler) as
      number | undefined;
    if (method === undefined) return [];
    const sub = (Reflect.getMetadata(PATH_METADATA, handler) as string) || '';
    const path = `/${base}/${sub}`
      .replace(/^\/api\/v1/, '')
      .replace(/:(\w+)/g, '{$1}')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');
    return [{ path: path || '/', method: methodNames[method] as string }];
  });
}

describe('public OpenAPI route coverage', () => {
  const controllers = [
    AuthController,
    AuthBffController,
    ProfileController,
    AdminController,
    PublicTripController,
    BillingWebhookController,
  ];

  it.each(controllers.flatMap(routesOf).map((r) => [r.method, r.path]))(
    'documents %s %s',
    (method, path) => {
      const item = document.paths[path] as Record<string, unknown> | undefined;
      expect(item?.[method]).toBeDefined();
    },
  );

  it('never leaves a success response without a schema', () => {
    for (const [path, item] of Object.entries(document.paths)) {
      for (const [method, operation] of Object.entries(item)) {
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method))
          continue;
        const responses = (
          operation as { responses: Record<string, { content?: unknown }> }
        ).responses;
        for (const [status, response] of Object.entries(responses)) {
          if (status.startsWith('2')) {
            expect({
              path,
              method,
              status,
              content: !!response.content,
            }).toEqual({ path, method, status, content: true });
          }
        }
      }
    }
  });

  it('advertises Idempotency-Key only on commands that honour it', () => {
    const withKey = Object.entries(document.paths).flatMap(([path, item]) =>
      Object.entries(item).flatMap(([method, operation]) =>
        JSON.stringify(
          (operation as { parameters?: unknown }).parameters,
        )?.includes('IdempotencyKey')
          ? [`${method} ${path}`]
          : [],
      ),
    );
    expect(withKey.sort()).toEqual([
      'post /public/trips/{tripId}/clone',
      'post /trips',
      'post /trips/{tripId}/days/{dayId}/stops',
    ]);
  });
});
