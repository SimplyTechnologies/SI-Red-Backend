import { GetVehiclesOptions, VehicleInput, VehicleResponse } from '../types/vehicle';
import { Vehicle, Model, Make } from '../models';
import FavoriteService from './FavoriteService';
import { Op, Sequelize } from 'sequelize';
import CustomerService from './CustomerService';
import createError from 'http-errors';
import { CreateOrUpdateCustomerRequest } from '../types/customer';

class VehicleService {
  getWhereClauseSearch(search?: string) {
    return {
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
    };
  }

  async createVehicle(data: VehicleInput, userId: string) {
    const vehicleData = {
      ...data,
      user_id: userId,
      status: data.status ?? 'in stock',
    };

    return await Vehicle.create(vehicleData);
  }

  async getAllVehicles({ userId, page, limit, search }: GetVehiclesOptions) {
    const offset = (page - 1) * limit;

    const favoriteIds = userId ? await FavoriteService.getFavoriteVehicleIds(userId) : new Set();

    const whereClause = search ? this.getWhereClauseSearch(search) : {};

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
    const whereClause = search ? this.getWhereClauseSearch(search) : {};

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

  async assignCustomerWithData(vehicleId: string, customerData: CreateOrUpdateCustomerRequest) {
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      throw new createError.NotFound('Vehicle not found');
    }

    if (vehicle.customer_id) {
      throw new createError.Conflict('Vehicle already assigned to a customer');
    }

    const customer = await CustomerService.createOrUpdateCustomer(customerData);

    await vehicle.update({
      customer_id: customer.id,
      status: 'sold',
    });

    return vehicle;
  }
}

export default new VehicleService();
