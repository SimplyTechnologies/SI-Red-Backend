import { Request } from 'express';
import { UserRole } from './user';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}
