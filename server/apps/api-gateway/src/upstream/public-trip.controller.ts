import { Controller, Get, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import type { AuthenticatedUserContext } from '../auth/auth.types';
import { CORE_TRIP_UPSTREAM, type UpstreamClient } from './upstream.types';

@Controller('api/v1/public/trips')
export class PublicTripController {
  constructor(@Inject(CORE_TRIP_UPSTREAM) private readonly trips: UpstreamClient) {}

  @Get()
  async list(@Res() response: Response): Promise<void> {
    const upstream = await this.trips.request({ method: 'GET', path: '/api/v1/trips/public', headers: {} });
    response.status(upstream.status).json(upstream.body);
  }

  @Get(':tripId')
  async get(@Param('tripId') tripId: string, @Res() response: Response): Promise<void> {
    const upstream = await this.trips.request({ method: 'GET', path: `/api/v1/trips/public/${encodeURIComponent(tripId)}`, headers: {} });
    response.status(upstream.status).json(upstream.body);
  }

  @Post(':tripId/clone')
  @UseGuards(SupabaseAuthGuard, CsrfGuard)
  async clone(@Param('tripId') tripId: string, @Req() request: Request, @Res() response: Response, @CurrentUser() user: AuthenticatedUserContext): Promise<void> {
    const idempotencyKey = request.header('idempotency-key');
    const upstream = await this.trips.request({
      method: 'POST', path: `/api/v1/trips/public/${encodeURIComponent(tripId)}/clone`,
      headers: { 'x-roadtrip-user-id': user.userId, ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}) },
    });
    response.status(upstream.status).json(upstream.body);
  }
}
