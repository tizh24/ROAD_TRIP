import type { OpenAPIObject, OperationObject } from '@nestjs/swagger';

const sessionSecurity = [{ supabaseBearer: [] }, { sessionCookie: [] }];
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
  security: sessionSecurity,
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

function publicAuthOperation(
  operationId: string,
  summary: string,
  requestSchema: string,
  responseSchema: string,
): OperationObject {
  return {
    operationId,
    summary,
    tags: ['Session'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: `#/components/schemas/${requestSchema}` },
        },
      },
    },
    responses: {
      '200': schemaResponse(responseSchema),
      '201': schemaResponse(responseSchema),
      '202': schemaResponse(responseSchema),
      '400': errorResponse,
      '429': errorResponse,
    },
  };
}

function cookieMutation(
  operationId: string,
  summary: string,
  responseSchema: string,
): OperationObject {
  return {
    operationId,
    summary,
    tags: ['Session'],
    security: [{ sessionCookie: [] }],
    parameters: [
      {
        name: 'X-CSRF-Token',
        in: 'header',
        required: true,
        schema: { type: 'string', minLength: 32 },
      },
    ],
    responses: {
      '200': schemaResponse(responseSchema),
      '401': errorResponse,
      '403': errorResponse,
    },
  };
}

function schemaResponse(schema: string) {
  return {
    description: 'Successful response.',
    content: {
      'application/json': {
        schema: { $ref: `#/components/schemas/${schema}` },
      },
    },
  };
}

function successEnvelope(data: object) {
  return {
    type: 'object',
    required: ['data', 'meta'],
    additionalProperties: false,
    properties: {
      data,
      meta: {
        type: 'object',
        required: ['correlationId'],
        properties: { correlationId: { type: 'string' } },
      },
    },
  };
}

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
    security: sessionSecurity,
    tags: [
      { name: 'Session' },
      { name: 'Profile' },
      { name: 'Trips' },
      { name: 'Stops' },
      { name: 'Invitations' },
      { name: 'Places' },
      { name: 'Routes' },
    ],
    paths: {
      '/auth/register': {
        post: publicAuthOperation(
          'register',
          'Register an email/password account. A response never reveals whether an email already exists.',
          'RegistrationRequest',
          'RegistrationResponse',
        ),
      },
      '/auth/login': {
        post: publicAuthOperation(
          'login',
          'Start a cookie-backed browser session.',
          'LoginRequest',
          'AuthenticationResponse',
        ),
      },
      '/auth/refresh': {
        post: cookieMutation(
          'refreshSession',
          'Rotate the cookie-backed browser session.',
          'AuthenticationResponse',
        ),
      },
      '/auth/logout': {
        post: cookieMutation(
          'logout',
          'End the browser session and clear its cookies.',
          'AuthenticationResponse',
        ),
      },
      '/auth/password/reset': {
        post: publicAuthOperation(
          'requestPasswordReset',
          'Request a password-reset email without revealing account existence.',
          'EmailRequest',
          'AcceptedResponse',
        ),
      },
      '/auth/password/change': {
        post: cookieMutation(
          'changePassword',
          'Change the password for the current session.',
          'PasswordChangeResponse',
        ),
      },
      '/me': {
        get: {
          ...authenticated(
            'getCurrentUser',
            'Get the current session identity.',
          ),
          tags: ['Session'],
        },
      },
      '/profile': {
        get: {
          ...authenticated('getProfile', 'Get the signed-in user profile.'),
          tags: ['Profile'],
        },
        patch: {
          ...cookieMutation(
            'updateProfile',
            'Update only the signed-in user presentation fields.',
            'ProfileResponse',
          ),
          tags: ['Profile'],
        },
      },
      '/admin/users/{userId}/role': {
        patch: {
          ...cookieMutation(
            'updateUserRole',
            'Update a platform user role (audited).',
            'ProfileResponse',
          ),
          tags: ['Admin'],
        },
        parameters: [pathParameter('userId')],
      },
      '/admin/users/{userId}/status': {
        patch: {
          ...cookieMutation(
            'updateUserStatus',
            'Update a platform user account status (audited).',
            'ProfileResponse',
          ),
          tags: ['Admin'],
        },
        parameters: [pathParameter('userId')],
      },
      '/admin/audit-logs': {
        get: {
          ...authenticated('listAuditLogs', 'List platform audit logs.'),
          tags: ['Admin'],
          responses: {
            '200': schemaResponse('AdminAuditLogListResponse'),
            '401': errorResponse,
            '403': errorResponse,
          },
        },
      },
      '/public/trips': {
        get: { operationId: 'listPublicTrips', summary: 'List published trips for discovery.', tags: ['Trips'], responses: { '200': schemaResponse('PublicTripListResponse') } },
      },
      '/public/trips/{tripId}': {
        get: { operationId: 'getPublicTrip', summary: 'Get a published trip.', tags: ['Trips'], responses: { '200': schemaResponse('PublicTripResponse'), '404': errorResponse } },
        parameters: [tripIdParameter()],
      },
      '/public/trips/{tripId}/clone': {
        post: { ...mutation('clonePublicTrip', 'Clone a published trip into a private draft.'), tags: ['Trips'], responses: { '200': schemaResponse('TripResponse'), '401': errorResponse, '404': errorResponse, '409': errorResponse } },
        parameters: [tripIdParameter()],
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
        get: {
          ...authenticated(
            'listTripInvitations',
            'List invitations. Requires trip owner permission.',
          ),
          tags: ['Invitations'],
        },
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
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: '__Secure-rt_access',
          description:
            'Gateway HttpOnly access cookie. Local development can configure a different name.',
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
        EmailRequest: {
          type: 'object',
          required: ['email'],
          additionalProperties: false,
          properties: { email: { type: 'string', format: 'email' } },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 8 },
          },
        },
        RegistrationRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 8 },
            fullName: { type: 'string', minLength: 2, maxLength: 80 },
          },
        },
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
        AuthenticationResponse: successEnvelope({
          type: 'object',
          required: ['authenticated'],
          properties: { authenticated: { type: 'boolean' } },
        }),
        RegistrationResponse: successEnvelope({
          type: 'object',
          required: ['confirmationRequired'],
          properties: { confirmationRequired: { type: 'boolean' } },
        }),
        AcceptedResponse: successEnvelope({
          type: 'object',
          required: ['accepted'],
          properties: { accepted: { type: 'boolean' } },
        }),
        PasswordChangeResponse: successEnvelope({
          type: 'object',
          required: ['changed'],
          properties: { changed: { type: 'boolean' } },
        }),
        ProfileResponse: successEnvelope({
          type: 'object',
          required: ['id', 'email', 'fullName', 'role', 'status'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            avatarUrl: { type: 'string', format: 'uri', nullable: true },
            role: {
              type: 'string',
              enum: ['USER', 'PARTNER', 'MODERATOR', 'ADMIN'],
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'BANNED', 'DELETED'],
            },
          },
        }),
        PublicTripListResponse: successEnvelope({ type: 'array', items: { $ref: '#/components/schemas/PublicTrip' } }),
        PublicTripResponse: successEnvelope({ $ref: '#/components/schemas/PublicTrip' }),
        TripResponse: successEnvelope({ type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } }),
        AdminAuditLogListResponse: successEnvelope({
          type: 'array',
          items: { $ref: '#/components/schemas/AdminAuditLog' },
        }),
        AdminAuditLog: {
          type: 'object',
          required: ['id', 'actorId', 'action', 'entityType', 'entityId', 'createdAt'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            actorId: { type: 'string', format: 'uuid' },
            action: { type: 'string' },
            entityType: { type: 'string' },
            entityId: { type: 'string' },
            oldValues: { type: 'object', nullable: true },
            newValues: { type: 'object', nullable: true },
            correlationId: { type: 'string', nullable: true },
            ipAddress: { type: 'string', nullable: true },
            userAgent: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PublicTrip: {
          type: 'object', required: ['id', 'title', 'startDate', 'endDate', 'budgetAmount', 'currency', 'days'],
          properties: { id: { type: 'string', format: 'uuid' }, title: { type: 'string' }, description: { type: 'string', nullable: true }, startDate: { type: 'string', format: 'date' }, endDate: { type: 'string', format: 'date' }, budgetAmount: { type: 'number' }, currency: { type: 'string' }, days: { type: 'array', items: { type: 'object' } } },
        },
      },
    },
  };
}

const stableErrorCodes = [
  'AUTH_REQUIRED',
  'AUTH_INVALID',
  'AUTH_RATE_LIMITED',
  'AUTH_UNAVAILABLE',
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
