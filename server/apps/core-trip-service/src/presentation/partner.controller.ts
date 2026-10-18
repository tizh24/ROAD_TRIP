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
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const businessName = string(body?.businessName, 'businessName');
      const businessType = string(body?.businessType, 'businessType');
      const contactEmail = string(body?.contactEmail, 'contactEmail');
      const contactPhone = string(body?.contactPhone, 'contactPhone');
      const taxId = body?.taxId ? String(body.taxId) : null;
      const description = body?.description ? String(body.description) : null;

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
            error: { code: 'FORBIDDEN', message: 'Yêu cầu tài khoản Đối tác hoặc Quản trị viên.' },
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
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'PARTNER' && role !== 'ADMIN') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu tài khoản Đối tác hoặc Quản trị viên.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const title = string(body?.title, 'title');
      const description = string(body?.description, 'description');
      const category = string(body?.category, 'category');
      const locationName = string(body?.locationName, 'locationName');
      const priceAmount = Number(body?.priceAmount);
      if (isNaN(priceAmount) || priceAmount < 0) {
        throw new HttpException(
          {
            error: { code: 'VALIDATION_FAILED', message: 'priceAmount phải là số không âm.' },
            meta: { correlationId: correlationId() },
          },
          400,
        );
      }
      const mediaUrls = Array.isArray(body?.mediaUrls) ? body.mediaUrls.filter((u: any) => typeof u === 'string') : [];

      const listing = await this.partner.createListing(userId, {
        title,
        description,
        category,
        locationName,
        priceAmount,
        priceCurrency: body?.priceCurrency || 'VND',
        mediaUrls,
        status: body?.status || 'ACTIVE',
      });
      return success(listing);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch('partner/listings/:id')
  async updateListing(
    @Param('id') listingId: string,
    @Body() body: any,
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
      const res = await this.partner.updateListing(userId, listingId, body);
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
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trị viên.' },
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
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const reviewerId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'ADMIN') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trị viên.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const action = body?.action === 'APPROVE' ? 'APPROVE' : 'REJECT';
      const notes = body?.notes ? String(body.notes) : undefined;
      const res = await this.partner.reviewApplication(applicationId, reviewerId, action, notes);
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
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trị viên.' },
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
        error: { code: 'AUTH_REQUIRED', message: `Missing required header ${name}` },
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
        error: { code: 'VALIDATION_FAILED', message: `${field} must be a non-empty string.` },
        meta: { correlationId: correlationId() },
      },
      400,
    );
  }
  return value.trim();
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
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error.' },
      meta: { correlationId: correlationId() },
    },
    500,
  );
}
