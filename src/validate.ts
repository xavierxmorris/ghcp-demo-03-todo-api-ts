import { z, type ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const createTodoSchema = z.object({
  title: z.string().min(1).max(280),
  done: z.boolean().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(280).optional(),
  done: z.boolean().optional(),
});

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };
}
