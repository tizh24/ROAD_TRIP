import { z } from 'zod';
import { apiErrorSchema } from './errors';
import { cursorPaginationMetaSchema } from './pagination';

export const responseMetaSchema = z
  .object({
    correlationId: z.string().min(1).max(128),
  })
  .strict();

export const errorResponseSchema = z
  .object({
    error: apiErrorSchema,
    meta: responseMetaSchema,
  })
  .strict();

export function successResponseSchema<T extends z.ZodType>(data: T) {
  return z.object({ data, meta: responseMetaSchema }).strict();
}

export function paginatedResponseSchema<T extends z.ZodType>(item: T) {
  return z
    .object({
      data: z.array(item),
      meta: responseMetaSchema.extend({
        pagination: cursorPaginationMetaSchema,
      }),
    })
    .strict();
}

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
