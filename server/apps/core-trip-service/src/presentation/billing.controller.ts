import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import { BillingRepository } from '../infrastructure/database/billing.repository';
import { TripAuthorizationPolicy } from '../application/authorization/trip-authorization.policy';
import { InternalServiceGuard } from './internal-service.guard';

@Controller('api/v1')
@UseGuards(InternalServiceGuard)
export class BillingController {
  constructor(
    private readonly billing: BillingRepository,
    private readonly authorization: TripAuthorizationPolicy,
  ) {}

  @Post('billing/orders')
  async createOrder(
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const itemType = string(body?.itemType, 'itemType');
      const itemId = string(body?.itemId, 'itemId');
      const title = string(body?.title, 'title');
      const amount = Number(body?.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new HttpException(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Số tiền thanh toán phải lớn hơn 0.',
            },
            meta: { correlationId: correlationId() },
          },
          400,
        );
      }
      const tripId = body?.tripId ? string(body.tripId, 'tripId') : null;

      const order = await this.billing.createOrder({
        userId,
        tripId,
        itemType,
        itemId,
        title,
        amount,
        currency: body?.currency || 'VND',
        metadata: body?.metadata || {},
      });
      return success(order);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('billing/orders/:orderId')
  async getOrder(
    @Param('orderId') orderId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const order = await this.billing.getOrder(orderId, userId);
      if (!order) {
        throw new HttpException(
          {
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Đơn hàng không tồn tại.',
            },
            meta: { correlationId: correlationId() },
          },
          404,
        );
      }
      return success(order);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('billing/orders')
  async listOrders(@Headers('x-roadtrip-user-id') actorId?: string) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const orders = await this.billing.listOrders(userId);
      return success(orders);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('billing/webhook')
  async handleWebhook(@Body() body: any) {
    try {
      // The public Gateway validates the provider HMAC before forwarding this
      // command over the internal-service channel. Core never accepts a
      // browser-originated webhook directly.
      const transactionId = string(body?.transactionId, 'transactionId');
      const orderId = string(body?.orderId, 'orderId');
      const amount = Number(body?.amount);
      const status = body?.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
      const signature = string(body?.signature, 'signature');
      const paymentMethod = body?.paymentMethod
        ? String(body.paymentMethod)
        : 'VIETQR';

      const result = await this.billing.processWebhook({
        transactionId,
        orderId,
        amount,
        status,
        signature,
        paymentMethod,
        payload: body?.payload || {},
      });
      return success(result);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('travel-books/trip/:tripId')
  async getOrCreateTravelBook(
    @Param('tripId') tripId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      await this.authorization.assertCanRead(tripId, userId);
      const book = await this.billing.getOrCreateTravelBook(tripId, userId);
      return success(book);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('travel-books/:id')
  async getTravelBook(
    @Param('id') bookId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const book = await this.billing.getTravelBook(bookId);
      if (!book) {
        throw new HttpException(
          {
            error: {
              code: 'TRAVEL_BOOK_NOT_FOUND',
              message: 'Không tìm thấy ấn phẩm Travel Book.',
            },
            meta: { correlationId: correlationId() },
          },
          404,
        );
      }
      await this.authorization.assertCanRead(book.tripId, userId);
      return success(book);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch('travel-books/:id')
  async updateTravelBook(
    @Param('id') bookId: string,
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const book = await this.billing.getTravelBook(bookId);
      if (!book) {
        throw new HttpException(
          {
            error: {
              code: 'TRAVEL_BOOK_NOT_FOUND',
              message: 'Không tìm thấy ấn phẩm Travel Book.',
            },
            meta: { correlationId: correlationId() },
          },
          404,
        );
      }
      await this.authorization.assertCanManageTrip(book.tripId, userId);
      const res = await this.billing.updateTravelBook(bookId, body);
      return success(res);
    } catch (error) {
      throw responseError(error);
    }
  }
}

function success<T>(data: T) {
  return { data, meta: { correlationId: correlationId() } };
}

function correlationId(): string {
  return getCorrelationId() ?? 'corr-billing';
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

function responseError(error: unknown): HttpException {
  if (error instanceof HttpException) return error;
  Logger.error(
    error instanceof Error ? error.message : 'Unexpected billing error.',
    error instanceof Error ? error.stack : undefined,
    'BillingController',
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
