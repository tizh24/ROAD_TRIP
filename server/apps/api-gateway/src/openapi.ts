import type { OpenAPIObject, OperationObject } from '@nestjs/swagger';
import { errorCodeSchema } from '@roadtrip/contracts';

const sessionSecurity = [{ supabaseBearer: [] }, { sessionCookie: [] }];
const webhookAck = {
  description: 'Webhook accepted.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ResourceResponse' },
    },
  },
};
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
    '200': schemaResponse('ResourceResponse'),
    '401': errorResponse,
    '403': errorResponse,
    '404': errorResponse,
  },
});

const mutation = (operationId: string, summary: string): OperationObject => ({
  ...authenticated(operationId, summary),
  requestBody: {
    required: false,
    content: { 'application/json': { schema: { type: 'object' } } },
  },
  parameters: [
    {
      name: 'X-CSRF-Token',
      in: 'header',
      required: false,
      description: 'Required for cookie-authenticated browser requests.',
      schema: { type: 'string', minLength: 32 },
    },
  ],
  responses: {
    '200': schemaResponse('ResourceResponse'),
    '400': errorResponse,
    '401': errorResponse,
    '403': errorResponse,
    '404': errorResponse,
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

function buildDocument(): OpenAPIObject {
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
      { name: 'Admin' },
      { name: 'Profile' },
      { name: 'Community' },
      { name: 'Partner' },
      { name: 'Billing' },
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
      '/auth/session/import': {
        post: publicAuthOperation(
          'importOAuthSession',
          'Convert a verified Supabase OAuth callback into Gateway cookies.',
          'ImportedSessionRequest',
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
        get: {
          operationId: 'listPublicTrips',
          summary: 'List published trips for discovery.',
          tags: ['Trips'],
          responses: { '200': schemaResponse('PublicTripListResponse') },
        },
      },
      '/public/trips/{tripId}': {
        get: {
          operationId: 'getPublicTrip',
          summary: 'Get a published trip.',
          tags: ['Trips'],
          responses: {
            '200': schemaResponse('PublicTripResponse'),
            '404': errorResponse,
          },
        },
        parameters: [tripIdParameter()],
      },
      '/public/trips/{tripId}/clone': {
        post: {
          ...mutation(
            'clonePublicTrip',
            'Clone a published trip into a private draft.',
          ),
          tags: ['Trips'],
          responses: {
            '200': schemaResponse('TripResponse'),
            '401': errorResponse,
            '404': errorResponse,
            '409': errorResponse,
          },
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/visibility': {
        patch: {
          ...mutation(
            'updateTripVisibility',
            'Set private, unlisted or published visibility.',
          ),
          tags: ['Trips'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/status': {
        patch: {
          ...mutation(
            'updateTripStatus',
            'Update planning, active or completed trip status.',
          ),
          tags: ['Trips'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/memory': {
        get: {
          ...authenticated('getTripMemory', 'Read the trip memory.'),
          tags: ['Trips'],
        },
        put: {
          ...mutation('updateTripMemory', 'Update the trip memory.'),
          tags: ['Trips'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/memory/photos': {
        post: {
          ...mutation('addTripMemoryPhoto', 'Add a photo to a trip memory.'),
          tags: ['Trips'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/expenses': {
        get: {
          ...authenticated('listTripExpenses', 'List trip expenses.'),
          tags: ['Trips'],
        },
        post: {
          ...mutation('createTripExpense', 'Record a trip expense.'),
          tags: ['Trips'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/locations': {
        get: {
          ...authenticated(
            'listTripLocations',
            'List consented active-trip locations.',
          ),
          tags: ['Trips'],
        },
        parameters: [tripIdParameter()],
      },
      '/trips/{tripId}/location': {
        post: {
          ...mutation(
            'recordTripLocation',
            'Record a consented active-trip location.',
          ),
          tags: ['Trips'],
        },
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
      '/community/posts': {
        get: {
          ...authenticated('listCommunityPosts', 'List community posts.'),
          tags: ['Community'],
        },
        post: {
          ...mutation('createCommunityPost', 'Create a community post.'),
          tags: ['Community'],
        },
      },
      '/community/posts/{postId}': {
        get: {
          ...authenticated('getCommunityPost', 'Read a community post.'),
          tags: ['Community'],
        },
        parameters: [pathParameter('postId')],
      },
      '/community/posts/{postId}/like': {
        post: {
          ...mutation('toggleCommunityLike', 'Toggle a community post like.'),
          tags: ['Community'],
        },
        parameters: [pathParameter('postId')],
      },
      '/community/posts/{postId}/comments': {
        get: {
          ...authenticated('listCommunityComments', 'List post comments.'),
          tags: ['Community'],
        },
        post: {
          ...mutation('createCommunityComment', 'Create a post comment.'),
          tags: ['Community'],
        },
        parameters: [pathParameter('postId')],
      },
      '/partner/application': {
        get: {
          ...authenticated(
            'getPartnerApplication',
            'Get the current partner application.',
          ),
          tags: ['Partner'],
        },
      },
      '/partner/apply': {
        post: {
          ...mutation('applyPartner', 'Submit a partner application.'),
          tags: ['Partner'],
        },
      },
      '/partner/listings': {
        get: {
          ...authenticated(
            'listPartnerListings',
            'List the current partner listings.',
          ),
          tags: ['Partner'],
        },
        post: {
          ...mutation('createPartnerListing', 'Create a partner listing.'),
          tags: ['Partner'],
        },
      },
      '/partner/listings/{id}': {
        patch: {
          ...mutation('updatePartnerListing', 'Update a partner listing.'),
          tags: ['Partner'],
        },
        delete: {
          ...mutation('deletePartnerListing', 'Delete a partner listing.'),
          tags: ['Partner'],
        },
        parameters: [pathParameter('id')],
      },
      '/billing/orders': {
        get: {
          ...authenticated(
            'listBillingOrders',
            'List the signed-in user orders.',
          ),
          tags: ['Billing'],
        },
        post: {
          ...mutation('createBillingOrder', 'Create a billing order.'),
          tags: ['Billing'],
        },
      },
      '/billing/orders/{orderId}': {
        get: {
          ...authenticated('getBillingOrder', 'Get a signed-in user order.'),
          tags: ['Billing'],
        },
        parameters: [pathParameter('orderId')],
      },
      '/billing/webhook': {
        post: {
          operationId: 'paymentWebhook',
          summary: 'Receive a provider-signed payment webhook.',
          tags: ['Billing'],
          parameters: [
            {
              name: 'X-Payment-Signature',
              in: 'header',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': webhookAck,
            '401': errorResponse,
            '503': errorResponse,
          },
        },
      },
      '/travel-books/trip/{tripId}': {
        get: {
          ...authenticated(
            'getOrCreateTravelBook',
            'Get or create a travel-book draft.',
          ),
          tags: ['Billing'],
        },
        parameters: [tripIdParameter()],
      },
      '/travel-books/{id}': {
        get: {
          ...authenticated('getTravelBook', 'Get a travel book.'),
          tags: ['Billing'],
        },
        patch: {
          ...mutation('updateTravelBook', 'Update a travel book.'),
          tags: ['Billing'],
        },
        parameters: [pathParameter('id')],
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
        ImportedSessionRequest: {
          type: 'object',
          required: ['accessToken', 'refreshToken', 'expiresIn'],
          additionalProperties: false,
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'integer', minimum: 1 },
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
        PublicTripListResponse: successEnvelope({
          type: 'array',
          items: { $ref: '#/components/schemas/PublicTrip' },
        }),
        PublicTripResponse: successEnvelope({
          $ref: '#/components/schemas/PublicTrip',
        }),
        TripResponse: successEnvelope({
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', format: 'uuid' } },
        }),
        AdminAuditLogListResponse: successEnvelope({
          type: 'array',
          items: { $ref: '#/components/schemas/AdminAuditLog' },
        }),
        AdminAuditLog: {
          type: 'object',
          required: [
            'id',
            'actorId',
            'action',
            'entityType',
            'entityId',
            'createdAt',
          ],
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
        ResourceResponse: successEnvelope({
          type: 'object',
          additionalProperties: true,
        }),
        ResourceListResponse: successEnvelope({
          type: 'array',
          items: { type: 'object', additionalProperties: true },
        }),
        Coordinate: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
          },
        },
        Place: {
          type: 'object',
          required: ['id', 'name', 'address', 'coordinate'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            coordinate: { $ref: '#/components/schemas/Coordinate' },
          },
        },
        PlaceListResponse: successEnvelope({
          type: 'array',
          items: { $ref: '#/components/schemas/Place' },
        }),
        RoutePreview: {
          type: 'object',
          required: [
            'geometry',
            'distanceMeters',
            'durationSeconds',
            'source',
            'calculatedAt',
          ],
          properties: {
            geometry: {
              type: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: { type: 'string', enum: ['LineString'] },
                coordinates: {
                  type: 'array',
                  items: { type: 'array', items: { type: 'number' } },
                },
              },
            },
            distanceMeters: { type: 'number', minimum: 0 },
            durationSeconds: { type: 'number', minimum: 0 },
            source: { type: 'string', enum: ['provider', 'cache'] },
            calculatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RoutePreviewResponse: successEnvelope({
          $ref: '#/components/schemas/RoutePreview',
        }),
        TripSummary: {
          type: 'object',
          required: [
            'id',
            'title',
            'startDate',
            'endDate',
            'status',
            'role',
            'permission',
            'version',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: {
              type: 'string',
              enum: ['PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
            },
            role: { type: 'string', enum: ['OWNER', 'MEMBER'] },
            permission: { type: 'string', enum: ['VIEW', 'EDIT'] },
            version: { type: 'integer', minimum: 1 },
          },
        },
        TripListResponse: successEnvelope({
          type: 'array',
          items: { $ref: '#/components/schemas/TripSummary' },
        }),
        TripDetailResponse: successEnvelope({
          allOf: [
            { $ref: '#/components/schemas/TripSummary' },
            {
              type: 'object',
              required: ['ownerId', 'budgetAmount', 'currency', 'days'],
              properties: {
                ownerId: { type: 'string', format: 'uuid' },
                description: { type: 'string', nullable: true },
                budgetAmount: { type: 'number', minimum: 0 },
                currency: { type: 'string', minLength: 3, maxLength: 3 },
                visibility: {
                  type: 'string',
                  enum: ['PRIVATE', 'UNLISTED', 'PUBLISHED'],
                },
                sourceTripId: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true,
                },
                days: { type: 'array', items: { type: 'object' } },
              },
            },
          ],
        }),
        VersionResponse: successEnvelope({
          type: 'object',
          required: ['version'],
          properties: { version: { type: 'integer', minimum: 1 } },
        }),
        StopMutationResponse: successEnvelope({
          type: 'object',
          required: ['id', 'tripId', 'dayId', 'stopIndex', 'version'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            tripId: { type: 'string', format: 'uuid' },
            dayId: { type: 'string', format: 'uuid' },
            stopIndex: { type: 'integer', minimum: 1 },
            version: { type: 'integer', minimum: 1 },
          },
        }),
        Invitation: {
          type: 'object',
          required: ['id', 'tripId', 'inviteeEmail', 'permission', 'status'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            tripId: { type: 'string', format: 'uuid' },
            inviteeEmail: { type: 'string', format: 'email' },
            permission: { type: 'string', enum: ['VIEW', 'EDIT'] },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED'],
            },
            expiresAt: { type: 'string', format: 'date-time' },
            acceptedUserId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        InvitationResponse: successEnvelope({
          $ref: '#/components/schemas/Invitation',
        }),
        InvitationListResponse: successEnvelope({
          type: 'array',
          items: { $ref: '#/components/schemas/Invitation' },
        }),
        MemberListResponse: successEnvelope({
          type: 'array',
          items: {
            type: 'object',
            required: ['userId', 'role', 'permission', 'status'],
            properties: {
              userId: { type: 'string', format: 'uuid' },
              role: { type: 'string', enum: ['OWNER', 'MEMBER'] },
              permission: { type: 'string', enum: ['VIEW', 'EDIT'] },
              status: { type: 'string', enum: ['ACTIVE', 'LEFT', 'REMOVED'] },
            },
          },
        }),
        PublicTrip: {
          type: 'object',
          required: [
            'id',
            'title',
            'startDate',
            'endDate',
            'budgetAmount',
            'currency',
            'days',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            budgetAmount: { type: 'number' },
            currency: { type: 'string' },
            days: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  };
}

const stableErrorCodes: string[] = [...errorCodeSchema.options];

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

/** Operations whose handlers read the header; no other operation advertises it. */
const idempotentOperations = new Set([
  'createTrip',
  'addStop',
  'clonePublicTrip',
]);
const versionedOperations = new Set([
  'updateTrip',
  'deleteTrip',
  'updateStop',
  'reorderStops',
  'moveStop',
]);
const responseSchemas: Record<string, string> = {
  listTrips: 'TripListResponse',
  getTrip: 'TripDetailResponse',
  createTrip: 'TripDetailResponse',
  updateTrip: 'VersionResponse',
  deleteTrip: 'VersionResponse',
  clonePublicTrip: 'TripDetailResponse',
  addStop: 'StopMutationResponse',
  updateStop: 'VersionResponse',
  searchPlaces: 'PlaceListResponse',
  previewRoute: 'RoutePreviewResponse',
  listTripMembers: 'MemberListResponse',
  listTripInvitations: 'InvitationListResponse',
  createInvitation: 'InvitationResponse',
  getInvitation: 'InvitationResponse',
  acceptInvitation: 'InvitationResponse',
  declineInvitation: 'InvitationResponse',
  listTripExpenses: 'ResourceListResponse',
  listTripLocations: 'ResourceListResponse',
  listCommunityPosts: 'ResourceListResponse',
  listCommunityComments: 'ResourceListResponse',
  listPartnerListings: 'ResourceListResponse',
  listBillingOrders: 'ResourceListResponse',
};

export function createPublicOpenApiDocument(): OpenAPIObject {
  const document = buildDocument();
  for (const pathItem of Object.values(document.paths)) {
    for (const operation of Object.values(pathItem) as unknown[]) {
      if (
        !operation ||
        typeof operation !== 'object' ||
        !('operationId' in operation)
      )
        continue;
      const op = operation as OperationObject;
      const id = op.operationId ?? '';
      const schema = responseSchemas[id];
      if (schema && op.responses['200'])
        op.responses['200'] = schemaResponse(schema);
      const extra = [
        ...(idempotentOperations.has(id)
          ? [{ $ref: '#/components/parameters/IdempotencyKey' }]
          : []),
        ...(versionedOperations.has(id)
          ? [{ $ref: '#/components/parameters/IfMatch' }]
          : []),
      ];
      if (extra.length) op.parameters = [...(op.parameters ?? []), ...extra];
    }
  }
  return document;
}
