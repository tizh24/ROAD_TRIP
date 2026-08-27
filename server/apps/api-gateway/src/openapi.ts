import type { OpenAPIObject, OperationObject } from '@nestjs/swagger';

const bearerSecurity = [{ supabaseBearer: [] }];
const emptyResponse = { description: 'Successful response.' };
const errorResponse = {
  description: 'A stable error envelope.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
};

const authenticated = (
  operationId: string,
  summary: string,
): OperationObject => ({
  operationId,
  summary,
  security: bearerSecurity,
  responses: {
    '200': emptyResponse,
    '401': errorResponse,
    '403': errorResponse,
  },
});

const mutation = (operationId: string, summary: string): OperationObject => ({
  ...authenticated(operationId, summary),
  parameters: [
    { $ref: '#/components/parameters/IdempotencyKey' },
    { $ref: '#/components/parameters/IfMatch' },
  ],
  responses: {
    '200': emptyResponse,
    '201': emptyResponse,
    '400': errorResponse,
    '401': errorResponse,
    '403': errorResponse,
    '409': errorResponse,
  },
});

const tripResource = {
  get: authenticated('getTrip', 'Get a trip available to the current user.'),
  patch: mutation(
    'updateTrip',
    'Update trip details using optimistic concurrency.',
  ),
  delete: mutation(
    'deleteTrip',
    'Soft-delete a trip owned by the current user.',
  ),
};

export function createPublicOpenApiDocument(): OpenAPIObject {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Road Trip Public API',
      version: 'v1',
      description:
        'Public API contracts served by the API Gateway. Internal service endpoints are intentionally excluded.',
    },
    servers: [{ url: '/api/v1', description: 'API Gateway v1' }],
    security: bearerSecurity,
    tags: [
      { name: 'Session' },
      { name: 'Trips' },
      { name: 'Stops' },
      { name: 'Invitations' },
      { name: 'Places' },
      { name: 'Routes' },
    ],
    paths: {
      '/me': {
        get: {
          ...authenticated(
            'getCurrentUser',
            'Get the current session identity.',
          ),
          tags: ['Session'],
        },
      },
      '/trips': {
        get: {
          ...authenticated(
            'listTrips',
            'List trips available to the current user.',
          ),
          tags: ['Trips'],
        },
        post: {
          ...mutation('createTrip', 'Create a trip and its sequential days.'),
          tags: ['Trips'],
        },
      },
      '/trips/{tripId}': { ...tripResource, parameters: [tripIdParameter()] },
      '/trips/{tripId}/days/{dayId}/stops': {
        post: {
          ...mutation('addStop', 'Add a place snapshot to a trip day.'),
          tags: ['Stops'],
        },
        parameters: [tripIdParameter(), dayIdParameter()],
      },
      '/trips/{tripId}/stops/{stopId}': {
        patch: {
          ...mutation('updateStop', 'Update an existing stop.'),
          tags: ['Stops'],
        },
        delete: {
          ...mutation('deleteStop', 'Delete an existing stop.'),
          tags: ['Stops'],
        },
        parameters: [tripIdParameter(), stopIdParameter()],
      },
      '/trips/{tripId}/days/{dayId}/stops/order': {
        put: {
          ...mutation('reorderStops', 'Reorder stops within a day.'),
          tags: ['Stops'],
        },
        parameters: [tripIdParameter(), dayIdParameter()],
      },
      '/trips/{tripId}/stops/{stopId}/day': {
        put: {
          ...mutation(
            'moveStop',
            'Move a stop to another day in the same trip.',
          ),
          tags: ['Stops'],
        },
        parameters: [tripIdParameter(), stopIdParameter()],
      },
      '/trips/{tripId}/members': {
        get: {
          ...authenticated('listTripMembers', 'List trip members.'),
          tags: ['Invitations'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/invitations': {
        post: {
          ...mutation('createInvitation', 'Invite a member to a trip.'),
          tags: ['Invitations'],
        },
        parameters: [tripIdParameter()],
      },
      '/trip-invitations/{token}': {
        get: {
          ...authenticated(
            'getInvitation',
            'Get invitation status for the signed-in user.',
          ),
          tags: ['Invitations'],
        },
        parameters: [tokenParameter()],
      },
      '/trip-invitations/{token}/accept': {
        post: {
          ...mutation('acceptInvitation', 'Accept a trip invitation.'),
          tags: ['Invitations'],
        },
        parameters: [tokenParameter()],
      },
      '/trip-invitations/{token}/decline': {
        post: {
          ...mutation('declineInvitation', 'Decline a trip invitation.'),
          tags: ['Invitations'],
        },
        parameters: [tokenParameter()],
      },
      '/trips/{tripId}/invitations/{invitationId}': {
        delete: {
          ...mutation('revokeInvitation', 'Revoke a pending invitation.'),
          tags: ['Invitations'],
        },
        parameters: [tripIdParameter(), invitationIdParameter()],
      },
      '/trips/{tripId}/members/{memberId}': {
        patch: {
          ...mutation('updateMemberPermission', 'Update a member permission.'),
          tags: ['Invitations'],
        },
        delete: {
          ...mutation('removeMember', 'Remove a trip member.'),
          tags: ['Invitations'],
        },
        parameters: [tripIdParameter(), memberIdParameter()],
      },
      '/places/search': {
        get: {
          ...authenticated(
            'searchPlaces',
            'Search places through the geo provider.',
          ),
          tags: ['Places'],
        },
      },
      '/routes/preview': {
        post: {
          ...mutation(
            'previewRoute',
            'Preview a route for ordered coordinates.',
          ),
          tags: ['Routes'],
        },
      },
    },
    components: {
      securitySchemes: {
        supabaseBearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase access token.',
        },
      },
      parameters: {
        IdempotencyKey: {
          name: 'Idempotency-Key',
          in: 'header',
          required: false,
          description:
            'Replay-safe command key. Reuse only for an identical request.',
          schema: { type: 'string', minLength: 1, maxLength: 255 },
        },
        IfMatch: {
          name: 'If-Match',
          in: 'header',
          required: false,
          description:
            'Expected aggregate version. A mismatch returns TRIP_VERSION_CONFLICT.',
          schema: { type: 'string', minLength: 1, maxLength: 64 },
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['error', 'meta'],
          additionalProperties: false,
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message'],
              additionalProperties: false,
              properties: {
                code: { type: 'string', enum: stableErrorCodes },
                message: { type: 'string' },
                details: { type: 'object', additionalProperties: true },
              },
            },
            meta: {
              type: 'object',
              required: ['correlationId'],
              additionalProperties: false,
              properties: { correlationId: { type: 'string' } },
            },
          },
        },
      },
    },
  };
}

const stableErrorCodes = [
  'AUTH_REQUIRED',
  'AUTH_INVALID',
  'FORBIDDEN',
  'TRIP_NOT_FOUND',
  'TRIP_DATE_RANGE_INVALID',
  'TRIP_DATE_RANGE_TOO_LONG',
  'TRIP_VERSION_CONFLICT',
  'DAY_NOT_FOUND',
  'STOP_NOT_FOUND',
  'STOP_ORDER_INVALID',
  'INVITATION_INVALID',
  'INVITATION_EXPIRED',
  'PLACE_PROVIDER_UNAVAILABLE',
  'ROUTE_UNAVAILABLE',
  'VALIDATION_FAILED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
];

function pathParameter(name: string) {
  return {
    name,
    in: 'path' as const,
    required: true,
    schema: { type: 'string', format: 'uuid' },
  };
}
function tripIdParameter() {
  return pathParameter('tripId');
}
function dayIdParameter() {
  return pathParameter('dayId');
}
function stopIdParameter() {
  return pathParameter('stopId');
}
function invitationIdParameter() {
  return pathParameter('invitationId');
}
function memberIdParameter() {
  return pathParameter('memberId');
}
function tokenParameter() {
  return {
    name: 'token',
    in: 'path' as const,
    required: true,
    schema: { type: 'string', minLength: 32 },
  };
}
