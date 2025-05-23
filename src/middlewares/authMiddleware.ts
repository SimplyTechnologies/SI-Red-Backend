import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const publicPaths = ['/auth/signin', '/docs', '/swagger.json'];
  const isPublic = req.path === '/' || publicPaths.some((path) => req.path.startsWith(path));

  if (isPublic) return next();

  return passport.authenticate('jwt', { session: false })(req, res, next);
};

export default authMiddleware;
