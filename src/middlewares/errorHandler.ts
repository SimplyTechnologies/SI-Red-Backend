import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const error = err as Partial<HttpError>;
  const status = error.status ?? 500;
  const message = error.message ?? 'Something went wrong';

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
  next();
}
