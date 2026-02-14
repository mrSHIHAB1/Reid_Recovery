import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (zodSchema: ZodSchema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = await zodSchema.parseAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
