import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { GatewayConfig } from '@roadtrip/config';
import { getCorrelationId } from '@roadtrip/observability';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { GATEWAY_AUTH_CONFIG } from '../auth/auth.types';
import { CORE_TRIP_UPSTREAM, type UpstreamClient } from './upstream.types';

/**
 * Provider-facing endpoint. Unlike browser APIs this intentionally has no
 * session or CSRF guard: its HMAC is the authentication mechanism.
 */
@Controller('api/v1/billing')
export class BillingWebhookController {
  constructor(
    @Inject(CORE_TRIP_UPSTREAM) private readonly coreTrip: UpstreamClient,
    @Inject(GATEWAY_AUTH_CONFIG) private readonly config: GatewayConfig,
  ) {}

  @Post('webhook')
  async webhook(
    @Body() body: unknown,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const signature = request.header('x-payment-signature');
    const secret = this.config.PAYMENT_WEBHOOK_SECRET;
    if (!secret) {
      throw new HttpException(
        envelope('PAYMENT_UNAVAILABLE', 'Payment webhook is not configured.'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!signature || !isValidSignature(body, signature, secret)) {
      throw new HttpException(
        envelope('AUTH_INVALID', 'Webhook signature is invalid.'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const upstream = await this.coreTrip.request({
      method: 'POST',
      path: '/api/v1/billing/webhook',
      headers: { 'x-correlation-id': getCorrelationId() ?? '' },
      body,
    });
    response.status(upstream.status).json(upstream.body);
  }
}

function isValidSignature(body: unknown, supplied: string, secret: string) {
  const expected = createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const suppliedBuffer = Buffer.from(supplied, 'utf8');
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
}

function envelope(code: string, message: string) {
  return {
    error: { code, message },
    meta: { correlationId: getCorrelationId() ?? '' },
  };
}
