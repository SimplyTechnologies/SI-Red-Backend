import { Vehicle, Model, Make } from '../models';
import { VehicleInput, VehicleResponse } from '../types/vehicle';
import FavoriteService from './FavoriteService';

class VehicleService {
  async createVehicle(data: VehicleInput) {
    const vehicleData = {
      ...data,
      status: data.status ?? 'in stock',
      location: data.location ?? '',
    };

    return await Vehicle.create(vehicleData);
  }

  async getAllVehicles(userId?: string) {
    const favoriteIds = userId ? await FavoriteService.getFavoriteVehicleIds(userId) : new Set();

    const vehicles = await Vehicle.findAll({
      include: [
        {
          model: Model as typeof Model & { new (): Model },
          as: 'model',
          attributes: ['name'],
          include: [
            {
              model: Make as typeof Make & { new (): Make },
              as: 'make',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    return vehicles.map((vehicle): VehicleResponse => {
      const plain = vehicle.get({ plain: true }) as Omit<VehicleResponse, 'isFavorite'>;
      return {
        ...plain,
        isFavorite: favoriteIds.has(vehicle.id),
      };
    });
  }

  async getVehicleById(id: string) {
    return await Vehicle.findByPk(id, {
      include: [
        {
          model: Model,
          as: 'model',
          attributes: ['name'],
          include: [
            {
              model: Make,
              as: 'make',
              attributes: ['name'],
            },
          ],
        },
      ],
    });
  }

  async deleteVehicle(id: string) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    await vehicle.destroy();
    return { message: 'Vehicle deleted successfully' };
  }

  async updateVehicle(id: string, updateData: Partial<VehicleInput>) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    await vehicle.update(updateData);
    return vehicle;
  }
}

export default new VehicleService();
