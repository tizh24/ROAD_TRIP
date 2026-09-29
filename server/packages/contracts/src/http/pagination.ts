import { z } from 'zod';

export const cursorPaginationQuerySchema = z
  .object({
    cursor: z.string().min(1).max(2048).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const cursorPaginationMetaSchema = z
  .object({
    nextCursor: z.string().min(1).nullable(),
    hasMore: z.boolean(),
  })
  .strict();

export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;
export type CursorPaginationMeta = z.infer<typeof cursorPaginationMetaSchema>;
