import { Optional } from 'sequelize';

export interface CustomerAttributes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; 
}

export interface CustomerResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  documents?: Array<{
    id: string;
    name: string;
    fileUrl: string;
    size: number;
    mimeType: string;
  }>;
}

export type CustomerCreationAttributes = Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export interface CreateOrUpdateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
export interface GetAllCustomersParams {
  page: number;
  limit: number;
  search?: string; 
}