import { sequelize } from '../config/db';
import createError from 'http-errors';
import { User, Vehicle } from '../models';
import { UserWithFavorites } from '../types/favorite';

export default class FavoriteService {
  static async addToFavorites(userId: string, vehicleId: string): Promise<void> {
    const user = (await User.findByPk(userId)) as UserWithFavorites;
    const vehicle = await Vehicle.findByPk(vehicleId);

    if (!user || !vehicle) {
      throw createError(404, 'User or Vehicle not found');
    }

    const exists = await sequelize.models.favorites.findOne({
      where: { userId, vehicleId },
    });

    if (exists) {
      throw createError(409, 'Vehicle is already in favorites');
    }

    try {
      await user.addFavoriteVehicle(vehicle);
    } catch (err) {
      console.error(err);
      throw createError(500, 'Failed to add vehicle to favorites');
    }
  }

  static async removeFromFavorites(userId: string, vehicleId: string): Promise<void> {
    const user = (await User.findByPk(userId)) as UserWithFavorites;
    const vehicle = await Vehicle.findByPk(vehicleId);

    if (!user || !vehicle) {
      throw createError(404, 'User or Vehicle not found');
    }

    try {
      await user.removeFavoriteVehicle(vehicle);
    } catch (err) {
      console.error(err);
      throw createError(500, 'Failed to remove vehicle from favorites');
    }
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
      throw createError(404, 'User not found');
    }

    return user.favoriteVehicles;
  }

  static async getFavoriteVehicleIds(userId: string): Promise<Set<string>> {
    const vehicles = await this.getFavoriteVehicles(userId);
    return new Set(vehicles.map((v) => v.id));
  }
}
