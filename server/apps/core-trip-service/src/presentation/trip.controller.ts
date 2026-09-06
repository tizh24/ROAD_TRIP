import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import {
  TripApplicationError,
  TripUseCases,
  type AddStopCommand,
  type UpdateStopCommand,
} from '../application/trip';
import { InternalServiceGuard } from './internal-service.guard';

@Controller('api/v1/trips')
@UseGuards(InternalServiceGuard)
export class TripController {
  constructor(private readonly trips: TripUseCases) {}

  @Post()
  async create(
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
  ) {
    try {
      const input = object(body);
      const budgetAmount = optionalNumber(input.budgetAmount, 'budgetAmount');
      const currency = optionalString(input.currency, 'currency');
      const trip = await this.trips.create({
        actorId: requiredHeader(actorId, 'x-roadtrip-user-id'),
        title: string(input.title, 'title'),
        ...(input.description === undefined
          ? {}
          : { description: nullableString(input.description, 'description') }),
        startDate: string(input.startDate, 'startDate'),
        endDate: string(input.endDate, 'endDate'),
        ...(budgetAmount !== undefined ? { budgetAmount } : {}),
        ...(currency ? { currency } : {}),
        correlationId: correlationId(),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      });
      return success(toTripDetailDto(trip));
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get()
  async list(@Headers('x-roadtrip-user-id') actorId: string | undefined) {
    try {
      const trips = await this.trips.list(
        requiredHeader(actorId, 'x-roadtrip-user-id'),
      );
      return success(trips.map(toTripListDto));
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get(':tripId')
  async get(
    @Param('tripId') tripId: string,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
  ) {
    try {
      return success(
        toTripDetailDto(
          await this.trips.get(
            requiredHeader(actorId, 'x-roadtrip-user-id'),
            tripId,
          ),
        ),
      );
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch(':tripId')
  async update(
    @Param('tripId') tripId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
  ) {
    try {
      const input = object(body);
      const version = await this.trips.update({
        actorId: requiredHeader(actorId, 'x-roadtrip-user-id'),
        tripId,
        title: string(input.title, 'title'),
        ...(input.description === undefined
          ? {}
          : { description: nullableString(input.description, 'description') }),
        startDate: string(input.startDate, 'startDate'),
        endDate: string(input.endDate, 'endDate'),
        budgetAmount: number(input.budgetAmount, 'budgetAmount'),
        currency: string(input.currency, 'currency'),
        expectedVersion: expectedVersion(ifMatch),
      });
      return success({ version: version.value });
    } catch (error) {
      throw responseError(error);
    }
  }

  @Delete(':tripId')
  async remove(
    @Param('tripId') tripId: string,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
  ) {
    try {
      return success({
        version: (
          await this.trips.softDelete(
            requiredHeader(actorId, 'x-roadtrip-user-id'),
            tripId,
            expectedVersion(ifMatch),
          )
        ).value,
      });
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post(':tripId/days/:dayId/stops')
  async addStop(
    @Param('tripId') tripId: string,
    @Param('dayId') dayId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
  ) {
    try {
      const input = object(body);
      const notes = optionalString(input.notes, 'notes');
      const command: AddStopCommand = {
        actorId: requiredHeader(actorId, 'x-roadtrip-user-id'),
        tripId,
        dayId,
        placeId: string(input.placeId, 'placeId'),
        name: string(input.name, 'name'),
        address: string(input.address, 'address'),
        latitude: number(input.latitude, 'latitude'),
        longitude: number(input.longitude, 'longitude'),
        ...(notes ? { notes } : {}),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      };
      return success(await this.trips.addStop(command));
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch(':tripId/stops/:stopId')
  async updateStop(
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
  ) {
    try {
      const input = object(body);
      const command: UpdateStopCommand = {
        actorId: requiredHeader(actorId, 'x-roadtrip-user-id'),
        tripId,
        stopId,
        name: string(input.name, 'name'),
        address: string(input.address, 'address'),
        latitude: number(input.latitude, 'latitude'),
        longitude: number(input.longitude, 'longitude'),
        notes: nullableString(input.notes, 'notes'),
        expectedVersion: expectedVersion(ifMatch),
      };
      return success({ version: await this.trips.updateStop(command) });
    } catch (error) {
      throw responseError(error);
    }
  }

  @Delete(':tripId/stops/:stopId')
  async removeStop(
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
  ) {
    try {
      await this.trips.removeStop(
        requiredHeader(actorId, 'x-roadtrip-user-id'),
        tripId,
        stopId,
      );
      return success({});
    } catch (error) {
      throw responseError(error);
    }
  }

  @Put(':tripId/days/:dayId/stops/order')
  async reorder(
    @Param('tripId') tripId: string,
    @Param('dayId') dayId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
  ) {
    try {
      const input = object(body);
      await this.trips.reorderStops(
        requiredHeader(actorId, 'x-roadtrip-user-id'),
        tripId,
        dayId,
        strings(input.orderedStopIds, 'orderedStopIds'),
      );
      return success({});
    } catch (error) {
      throw responseError(error);
    }
  }

  @Put(':tripId/stops/:stopId/day')
  async move(
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId: string | undefined,
  ) {
    try {
      const input = object(body);
      await this.trips.moveStop(
        requiredHeader(actorId, 'x-roadtrip-user-id'),
        tripId,
        stopId,
        string(input.targetDayId, 'targetDayId'),
        number(input.targetIndex, 'targetIndex'),
      );
      return success({});
    } catch (error) {
      throw responseError(error);
    }
  }
}

function success(data: unknown) {
  return { data, meta: { correlationId: correlationId() } };
}
function correlationId() {
  return getCorrelationId() ?? 'unknown';
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      'Request body must be an object.',
    );
  return value as Record<string, unknown>;
}
function string(value: unknown, field: string): string {
  if (typeof value !== 'string')
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      `${field} must be a string.`,
    );
  return value;
}
function optionalString(value: unknown, field: string): string | undefined {
  return value === undefined ? undefined : string(value, field);
}
function nullableString(value: unknown, field: string): string | null {
  return value === null ? null : string(value, field);
}
function number(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      `${field} must be a finite number.`,
    );
  return value;
}
function optionalNumber(value: unknown, field: string): number | undefined {
  return value === undefined ? undefined : number(value, field);
}
function strings(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string'))
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      `${field} must be an array of strings.`,
    );
  return value;
}
function requiredHeader(value: string | undefined, name: string): string {
  if (!value)
    throw new TripApplicationError('VALIDATION_FAILED', `${name} is required.`);
  return value;
}
function expectedVersion(value: string | undefined): number {
  if (!value || !/^\d+$/.test(value))
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      'If-Match must be a positive integer.',
    );
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1)
    throw new TripApplicationError(
      'VALIDATION_FAILED',
      'If-Match must be a positive integer.',
    );
  return parsed;
}
function responseError(error: unknown): HttpException {
  const applicationError =
    error instanceof TripApplicationError
      ? error
      : new TripApplicationError(
          'VALIDATION_FAILED',
          'The request is invalid.',
        );
  const status =
    applicationError.code === 'TRIP_NOT_FOUND'
      ? 404
      : applicationError.code === 'FORBIDDEN'
        ? 403
        : applicationError.code === 'TRIP_VERSION_CONFLICT'
          ? 409
          : 400;
  return new HttpException(
    {
      error: { code: applicationError.code, message: applicationError.message },
      meta: { correlationId: correlationId() },
    },
    status,
  );
}
function toTripListDto(row: {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  role: string;
  permission: string;
  version: number;
}) {
  return {
    id: row.id,
    title: row.title,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    role: row.role,
    permission: row.permission,
    version: row.version,
  };
}
function toTripDetailDto(
  row: ReturnType<TripUseCases['get']> extends Promise<infer Detail>
    ? Detail
    : never,
) {
  return {
    ...toTripListDto(row),
    ownerId: row.ownerId,
    description: row.description,
    budgetAmount: row.budgetAmount,
    currency: row.currency,
    days: row.days,
  };
}
