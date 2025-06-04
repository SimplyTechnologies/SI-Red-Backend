import { Optional } from 'sequelize';

export interface CustomerAttributes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerCreationAttributes = Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export interface CreateOrUpdateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}