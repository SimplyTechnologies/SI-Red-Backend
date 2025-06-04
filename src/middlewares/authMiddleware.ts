import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const publicPaths = ['/auth/signin', '/docs', '/swagger.json'];

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const isPublic = req.path === '/' || publicPaths.some((path) => req.path.startsWith(path));
  if (isPublic) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded; // temprory solution need to try resolve without any
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
