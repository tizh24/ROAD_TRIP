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
  Query,
  UseGuards,
} from '@nestjs/common';
import { getCorrelationId } from '@roadtrip/observability';
import { CommunityRepository } from '../infrastructure/database/community.repository';
import { InternalServiceGuard } from './internal-service.guard';

@Controller('api/v1/community')
@UseGuards(InternalServiceGuard)
export class CommunityController {
  constructor(private readonly community: CommunityRepository) {}

  @Get('posts')
  async listPosts(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const limit = limitStr ? Math.min(Math.max(parseInt(limitStr, 10), 1), 50) : 20;
      const offset = offsetStr ? Math.max(parseInt(offsetStr, 10), 0) : 0;
      const posts = await this.community.listPosts(actorId, limit, offset);
      return success(posts);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('posts/:postId')
  async getPost(
    @Param('postId') postId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const post = await this.community.getPost(postId, actorId);
      if (!post) {
        throw new HttpException(
          {
            error: { code: 'POST_NOT_FOUND', message: 'Bài viết không tồn tại.' },
            meta: { correlationId: correlationId() },
          },
          404,
        );
      }
      return success(post);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('posts')
  async createPost(
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const title = string(body?.title, 'title');
      const content = string(body?.content, 'content');
      const tripId = body?.tripId ? string(body.tripId, 'tripId') : null;
      const mediaUrls = Array.isArray(body?.mediaUrls) ? body.mediaUrls.filter((u: any) => typeof u === 'string') : [];
      const locationName = body?.locationName ? string(body.locationName, 'locationName') : null;

      const post = await this.community.createPost({
        authorId: userId,
        title,
        content,
        tripId,
        mediaUrls,
        locationName,
      });
      return success(post);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('posts/:postId/like')
  async toggleLike(
    @Param('postId') postId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const result = await this.community.toggleLike(postId, userId);
      return success(result);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('posts/:postId/save')
  async toggleSave(
    @Param('postId') postId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const result = await this.community.toggleSave(postId, userId);
      return success(result);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('posts/:postId/comments')
  async listComments(@Param('postId') postId: string) {
    try {
      const comments = await this.community.listComments(postId);
      return success(comments);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('posts/:postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const content = string(body?.content, 'content');
      const comment = await this.community.createComment({
        postId,
        authorId: userId,
        content,
      });
      return success(comment);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('reports')
  async createReport(
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const targetType = string(body?.targetType, 'targetType') as 'POST' | 'COMMENT' | 'TRIP' | 'USER';
      const targetId = string(body?.targetId, 'targetId');
      const reason = string(body?.reason, 'reason');
      const details = body?.details ? string(body.details, 'details') : null;

      const report = await this.community.createReport({
        reporterId: userId,
        targetType,
        targetId,
        reason,
        details,
      });
      return success(report);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Post('users/:userId/follow')
  async toggleFollow(
    @Param('userId') targetUserId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const userId = requiredHeader(actorId, 'x-roadtrip-user-id');
      const result = await this.community.toggleFollow(userId, targetUserId);
      return success(result);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('users/:userId/profile')
  async getUserProfile(
    @Param('userId') targetUserId: string,
    @Headers('x-roadtrip-user-id') actorId?: string,
  ) {
    try {
      const profile = await this.community.getUserProfile(targetUserId, actorId);
      if (!profile) {
        throw new HttpException(
          {
            error: { code: 'USER_NOT_FOUND', message: 'Hồ sơ người dùng không tồn tại.' },
            meta: { correlationId: correlationId() },
          },
          404,
        );
      }
      return success(profile);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Get('moderation/reports')
  async listReports(
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      if (role !== 'ADMIN' && role !== 'MODERATOR') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trị viên hoặc Kiểm duyệt viên.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const reports = await this.community.listReports();
      return success(reports);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch('moderation/reports/:reportId')
  async resolveReport(
    @Param('reportId') reportId: string,
    @Body() body: any,
    @Headers('x-roadtrip-user-id') actorId?: string,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      const reviewerId = requiredHeader(actorId, 'x-roadtrip-user-id');
      if (role !== 'ADMIN' && role !== 'MODERATOR') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trị viên hoặc Kiểm duyệt viên.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const status = body?.status === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED';
      const notes = body?.notes ? String(body.notes) : undefined;
      const res = await this.community.resolveReport(reportId, reviewerId, status, notes);
      return success(res);
    } catch (error) {
      throw responseError(error);
    }
  }

  @Patch('moderation/posts/:postId')
  async updatePostStatus(
    @Param('postId') postId: string,
    @Body() body: any,
    @Headers('x-roadtrip-user-role') role?: string,
  ) {
    try {
      if (role !== 'ADMIN' && role !== 'MODERATOR') {
        throw new HttpException(
          {
            error: { code: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trị viên hoặc Kiểm duyệt viên.' },
            meta: { correlationId: correlationId() },
          },
          403,
        );
      }
      const status = body?.status;
      if (!['PUBLISHED', 'HIDDEN', 'FLAGGED', 'DELETED'].includes(status)) {
        throw new HttpException(
          {
            error: { code: 'VALIDATION_FAILED', message: 'Trạng thái bài viết không hợp lệ.' },
            meta: { correlationId: correlationId() },
          },
          400,
        );
      }
      await this.community.updatePostStatus(postId, status);
      return success({ id: postId, status });
    } catch (error) {
      throw responseError(error);
    }
  }
}

function success<T>(data: T) {
  return { data, meta: { correlationId: correlationId() } };
}

function correlationId(): string {
  return getCorrelationId() ?? 'corr-community';
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
    error instanceof Error ? error.message : 'Unexpected community error.',
    error instanceof Error ? error.stack : undefined,
    'CommunityController',
  );
  return new HttpException(
    {
      error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error.' },
      meta: { correlationId: correlationId() },
    },
    500,
  );
}
