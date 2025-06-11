import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user';
import { AuthenticatedRequest } from '../types/auth';
import { User } from '../models';

const publicPaths = ['/auth/signin', '/docs', '/swagger.json', '/users/verify', '/users/activate'];

const validRoles: UserRole[] = ['SUPER_ADMIN', 'USER'];

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      iat: number;
    };

    const user = await User.findByPk(decoded.userId);
    if (!user || !validRoles.includes(decoded.role as UserRole)) {
      res.status(403).json({ message: 'Invalid user or role' });
      return;
    }

    if (user.forceLogoutAt && decoded.iat * 1000 < new Date(user.forceLogoutAt).getTime()) {
      res.status(401).json({ message: 'Force logout required' });
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
