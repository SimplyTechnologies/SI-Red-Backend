import { Vehicle, User } from '../models';

export interface FavoriteRequestBody {
  user_id: string;
  vehicle_id: string;
}

export interface UserWithFavorites extends User {
  addFavoriteVehicle: (vehicle: Vehicle | string) => Promise<void>;
  removeFavoriteVehicle: (vehicle: Vehicle | string) => Promise<void>;
  favoriteVehicles: Vehicle[];
}
