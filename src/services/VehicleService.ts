import { Vehicle, Model, Make } from '../models';
import { GetVehiclesOptions, VehicleInput, VehicleResponse } from '../types/vehicle';
import FavoriteService from './FavoriteService';
import { Op, Sequelize } from 'sequelize';

class VehicleService {
  async createVehicle(data: VehicleInput) {
    const vehicleData = {
      ...data,
      status: data.status ?? 'in stock',
      location: data.location ?? '',
    };

    return await Vehicle.create(vehicleData);
  }

  async getAllVehicles({ userId, page, limit, search }: GetVehiclesOptions) {
    const offset = (page - 1) * limit;

    const favoriteIds = userId ? await FavoriteService.getFavoriteVehicleIds(userId) : new Set();

    const whereClause = search
      ? {
          [Op.or]: [
            Sequelize.where(Sequelize.col('model.name'), {
              [Op.iLike]: `%${search}%`,
            }),
            Sequelize.where(Sequelize.col('model.make.name'), {
              [Op.iLike]: `%${search}%`,
            }),
            Sequelize.where(Sequelize.col('year'), {
              [Op.iLike]: `%${search}%`,
            }),
            Sequelize.where(Sequelize.col('vin'), {
              [Op.iLike]: `%${search}%`,
            }),
          ],
        }
      : {};

    const vehicles = await Vehicle.findAll({
      where: whereClause,
      include: [
        {
          model: Model,
          as: 'model',
          required: !!search,
          attributes: ['name'],
          include: [
            {
              model: Make,
              as: 'make',
              required: false,
              attributes: ['name'],
            },
          ],
        },
      ],
      limit,
      offset,
    });

    return vehicles.map((vehicle): VehicleResponse => {
      const plain = vehicle.get({ plain: true }) as Omit<VehicleResponse, 'isFavorite'>;
      return {
        ...plain,
        isFavorite: favoriteIds.has(vehicle.id),
      };
    });
  }

  async getVehicleMapPoints(search?: string) {
    const whereClause = search
      ? {
          [Op.or]: [
            Sequelize.where(Sequelize.col('model.name'), {
              [Op.iLike]: `%${search}%`,
            }),
            Sequelize.where(Sequelize.col('model.make.name'), {
              [Op.iLike]: `%${search}%`,
            }),
            Sequelize.where(Sequelize.col('year'), {
              [Op.iLike]: `%${search}%`,
            }),
            Sequelize.where(Sequelize.col('vin'), {
              [Op.iLike]: `%${search}%`,
            }),
          ],
        }
      : {};

    const vehicles = await Vehicle.findAll({
      attributes: ['id', 'location'],
      where: whereClause,
      include: [
        {
          model: Model,
          as: 'model',
          required: !!search, 
          attributes: [],
          include: [
            {
              model: Make,
              as: 'make',
              attributes: [],
            },
          ],
        },
      ],
    });

    return vehicles.map((vehicle) => vehicle.get({ plain: true }));
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
