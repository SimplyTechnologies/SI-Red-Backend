/* eslint-disable */
import { Request } from 'express';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  const user = (request as any).user;

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
