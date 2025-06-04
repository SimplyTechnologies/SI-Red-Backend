import { AuthenticatedRequest } from '../types/auth';

export function getUserIdOrThrow(
  req: AuthenticatedRequest,
  setStatus?: (code: number) => void
): string {
  if (!req.user?.userId) {
    if (setStatus) setStatus(401);
    throw new Error('Unauthorized');
  }
  return req.user.userId;
}
