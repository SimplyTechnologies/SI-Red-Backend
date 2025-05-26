import { sequelize } from '../config/db';
import { User, Vehicle } from '../models';

interface UserWithFavorites extends User {
  addFavoriteVehicle: (vehicle: Vehicle | string) => Promise<void>;
  removeFavoriteVehicle: (vehicle: Vehicle | string) => Promise<void>;
  favoriteVehicles: Vehicle[];
}

export default class FavoriteService {
  static async addToFavorites(userId: string, vehicleId: string): Promise<void> {
    const user = (await User.findByPk(userId)) as UserWithFavorites;
    const vehicle = await Vehicle.findByPk(vehicleId);

    if (!user || !vehicle) {
      throw new Error('User or Vehicle not found');
    }

    const exists = await sequelize.models.favorites.findOne({
      where: { userId, vehicleId },
    });

    if (exists) {
      throw new Error('Already in favorites');
    }

    try {
      await user.addFavoriteVehicle(vehicle);
    } catch (err) {
      console.error(err);
    }
  }

  static async removeFromFavorites(userId: string, vehicleId: string): Promise<void> {
    const user = (await User.findByPk(userId)) as UserWithFavorites;
    const vehicle = await Vehicle.findByPk(vehicleId);

    if (!user || !vehicle) {
      throw new Error('User or Vehicle not found');
    }

    await user.removeFavoriteVehicle(vehicle);
  }

  static async getFavoriteVehicles(userId: string): Promise<Vehicle[]> {
    const user = (await User.findByPk(userId, {
      include: [
        {
          model: Vehicle,
          as: 'favoriteVehicles',
          through: { attributes: [] },
        },
      ],
    })) as UserWithFavorites;

    if (!user) {
      throw new Error('User not found');
    }

    return user.favoriteVehicles;
  }
}
