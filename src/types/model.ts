import { Optional } from "sequelize";

export interface ModelAttributes {
  id: number;
  name: string;
  make_id: number;
}

export interface ModelResponse {
  id: number;
  name: string;
  make_id: number;
}

export type ModelCreationAttributes = Optional<ModelAttributes, 'id'>
