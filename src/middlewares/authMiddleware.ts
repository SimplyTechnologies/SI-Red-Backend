import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user';
import { AuthenticatedRequest } from '../types/auth';

const publicPaths = [
  '/auth/signin',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/docs',
  '/swagger.json',
  '/users/verify',
  '/users/activate',
  '/auth/verify-reset-token',
];

const validRoles: UserRole[] = ['SUPER_ADMIN', 'USER'];

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const isPublic = publicPaths.some((path) => req.path.startsWith(path));
    if (isPublic) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    if (!validRoles.includes(decoded.role as UserRole)) {
      res.status(403).json({ message: 'Invalid role' });
      return;
    }

    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
