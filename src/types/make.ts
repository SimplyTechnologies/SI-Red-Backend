import { Optional } from "sequelize";

export interface MakeResponse {
  id: number;
  name: string;
}

export interface MakeAttributes {
  id: number;
  name: string;
}

export type MakeCreationAttributes = Optional<MakeAttributes, 'id'>;
