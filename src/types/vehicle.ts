import { Optional } from 'sequelize';

export interface MakeInfo {
  id: number;
  name: string;
}

export interface ModelInfo {
  id: number;
  name: string;
  make: MakeInfo;
}

export interface GetVehiclesOptions {
  userId?: string;
  page: number;
  limit: number;
  search?: string;
}

export interface VehicleInput {
  model_id: number;
  year: string;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  customer_id?: string;
  status?: string;
  location: string;
  assignedDate?: Date | null;
}

export interface VehicleResponse extends Omit<VehicleInput, 'customer_id'> {
  id: string;
  customer_id?: string | null;
  status: string;
  location: string;
  model?: ModelInfo;
  isFavorite?: boolean;
  assignedDate?: Date | null;
  createdAt?: Date;
}

export interface VehicleAttributes {
  id: string;
  model_id: number;
  user_id: string;
  year: string;
  customer_id?: string | null;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  status: string;
  location: string;
  assignedDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type VehicleCreationAttributes = Optional<
  VehicleAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'customer_id' | 'assignedDate'
>;

export type VehicleMapPoint = {
  id: string;
  location: string;
};
