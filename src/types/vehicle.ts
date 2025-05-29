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

export interface VehicleInput {
  model_id: number;
  year: string;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  user_id: string;
  status?: string;
  location?: string;
}

export interface VehicleResponse extends VehicleInput {
  id: string;
  status: string;
  location: string;
  model?: ModelInfo;
  isFavorite?: boolean;
  createdAt?: Date; 
}

export interface VehicleAttributes {
  id: string;
  model_id: number;
  user_id: string;
  year: string;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  status: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type VehicleCreationAttributes = Optional<
  VehicleAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
