
export type UserRole = 'SUPER_ADMIN' | 'USER';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  newAccessToken?: string;
  message?: string;
}
