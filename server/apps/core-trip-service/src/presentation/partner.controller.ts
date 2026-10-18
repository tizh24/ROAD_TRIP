import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import { PartnerRepository } from '../infrastructure/database/partner.repository';
import { InternalServiceGuard } from './internal-service.guard';

@Controller('api/v1')
@UseGuards(InternalServiceGuard)
export class PartnerController {
  constructor(private readonly partner: PartnerRepository) {}

  @Post('partner/apply')
  async submitApplication(
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const input = record(body);
      const businessName = string(input.businessName, 'businessName');
      const businessType = string(input.businessType, 'businessType');
      const contactEmail = string(input.contactEmail, 'contactEmail');
      const contactPhone = string(input.contactPhone, 'contactPhone');
      const taxId = optionalString(input.taxId, 'taxId');
      const description = optionalString(input.description, 'description');

      const app = await this.partner.submitApplication({
        userId,
        businessName,
        businessType,
        contactEmail,
        contactPhone,
        taxId,
        description,
      });
      return success(app);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('partner/application')
  async getApplicationStatus(@Headers('x-roadtrip-user-id') actorId?: string) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const app = await this.partner.getApplication(userId);
      if (!app) {
        return success({ status: 'NONE' });
      }
      return success(app);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('partner/listings')
  async listListings(
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'PARTNER' && role !== 'ADMIN') {
        throw new HttpException(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Yêu cầu tài khoản Đối tác hoặc Quản trị viên.',
            },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const listings = await this.partner.listListings(userId);
      return success(listings);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('partner/listings')
  async createListing(
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'PARTNER' && role !== 'ADMIN') {
        throw new HttpException(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Yêu cầu tài khoản Đối tác hoặc Quản trị viên.',
            },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const input = record(body);
      const title = string(input.title, 'title');
      const description = string(input.description, 'description');
      const category = string(input.category, 'category');
      const locationName = string(input.locationName, 'locationName');
      const priceAmount = Number(input.priceAmount);
      if (isNaN(priceAmount) || priceAmount < 0) {
        throw new HttpException(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: 'priceAmount phải là số không âm.',
            },
            meta: { correlationId: correlationId() },
          },
          400,
        );
      }
      const mediaUrls = stringArray(input.mediaUrls);

      const listing = await this.partner.createListing(userId, {
        title,
        description,
        category,
        locationName,
        priceAmount,
        priceCurrency:
          optionalString(input.priceCurrency, 'priceCurrency') ?? 'VND',
        mediaUrls,
        status: optionalString(input.status, 'status') ?? 'ACTIVE',
      });
      return success(listing);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch('partner/listings/:id')
  async updateListing(
    @Param('id') listingId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'PARTNER' && role !== 'ADMIN') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Đối tác.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const res = await this.partner.updateListing(
        userId,
        listingId,
        record(body),
      );
      return success(res);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Delete('partner/listings/:id')
  async deleteListing(
    @Param('id') listingId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'PARTNER' && role !== 'ADMIN') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Đối tác.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const res = await this.partner.deleteListing(userId, listingId);
      return success(res);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('admin/partners/applications')
  async listAdminApplications(
    @Query('status') status?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      if (role !== 'ADMIN') {
        throw new HttpException(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Yêu cầu quyền Quản trị viên.',
            },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const applications = await this.partner.listApplications(status);
      return success(applications);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('admin/partners/applications/:id/review')
  async reviewApplication(
    @Param('id') applicationId: string,
    @Body() body: unknown,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const reviewerId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'ADMIN') {
        throw new HttpException(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Yêu cầu quyền Quản trị viên.',
            },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const input = record(body);
      const action = input.action === 'APPROVE' ? 'APPROVE' : 'REJECT';
      const notes = optionalString(input.notes, 'notes') ?? undefined;
      const res = await this.partner.reviewApplication(
        applicationId,
        reviewerId,
        action,
        notes,
      );
      return success(res);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('admin/users')
  async listAdminUsers(@Headers('x-roadtrip-user-role') role?: string) {
    try {
      if (role !== 'ADMIN') {
        throw new HttpException(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Yêu cầu quyền Quản trị viên.',
            },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const users = await this.partner.listAllUsersForAdmin();
      return success(users);
    } catch (error) {
      throw responseError(error);
    }
  }
}

function success<T>(data: T) {
  return { data, meta: { correlationId: correlationId() } };
}

function correlationId(): string {
  return getCorrelationId() ?? 'corr-partner';
}

function requiredHeader(value: string | undefined, name: string): string {
  if (!value || typeof value !== 'string') {
    throw new HttpException(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: `Missing required header ${name}`,
        },
        meta: { correlationId: correlationId() },
      },
      401,
    );
  }
  return value;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpException(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: `${field} must be a non-empty string.`,
        },
        meta: { correlationId: correlationId() },
      },
      400,
    );
  }
  return value.trim();
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpException(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request body must be an object.',
        },
        meta: { correlationId: correlationId() },
      },
      400,
    );
  }
  return value as Record<string, unknown>;
}

function optionalString(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  return string(value, field);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function responseError(error: unknown): HttpException {
  if (error instanceof HttpException) return error;
  Logger.error(
    error instanceof Error ? error.message : 'Unexpected partner error.',
    error instanceof Error ? error.stack : undefined,
    'PartnerController',
  );
  return new HttpException(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Internal error.',
      },
      meta: { correlationId: correlationId() },
    },
    500,
  );
}
