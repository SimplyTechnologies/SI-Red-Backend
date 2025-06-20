export type UserRole = 'SUPER_ADMIN' | 'USER';

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
}

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
  forceLogoutAt: Date | null;
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
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  newAccessToken?: string;
  message?: string;
}

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export type UpdateUserResponse = Pick<
  UserAttributes,
  'firstName' | 'lastName' | 'phoneNumber' | 'email'
>;
