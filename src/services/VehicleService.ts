import { GetVehiclesOptions, VehicleInput, VehicleResponse } from '../types/vehicle';
import { Vehicle, Model, Make, Customer } from '../models';
import FavoriteService from './FavoriteService';
import { Op, Sequelize, UniqueConstraintError } from 'sequelize';
import CustomerService from './CustomerService';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import { sequelize } from '../config/db';
import createHttpError from 'http-errors';

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
    try {
      const vehicleData = {
        ...data,
        user_id: userId,
        status: data.status ?? 'in stock',
      };

      const model = await Model.findByPk(data.model_id, {
        include: [{ model: Make, as: 'make' }],
      });

      if (!model) {
        throw new createHttpError.BadRequest('Model not found.');
      }

      const modelMake = await Make.findByPk(model.make_id);
      if (!modelMake) {
        throw new createHttpError.BadRequest('Make for model not found.');
      }

      if (typeof data.make_id === 'number' && model.make_id !== data.make_id) {
        throw new createHttpError.Conflict('Selected model does not belong to the specified make.');
      }

      return await Vehicle.create(vehicleData);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new createHttpError.BadRequest('VIN already exists.');
      }

      console.error(err);
      throw err;
    }
  }

  async getAllVehicles({
    userId,
    page,
    limit,
    search,
    make,
    model,
    availability,
  }: GetVehiclesOptions) {
    const offset = (page - 1) * limit;

    const favoriteIds = userId ? await FavoriteService.getFavoriteVehicleIds(userId) : new Set();

    const searchClause = search ? this.getWhereClauseSearch(search) : {};

    if (model?.length && !make) {
      throw new createHttpError.BadRequest('Make must be selected when filtering by model.');
    }

    const whereClause = {
      ...searchClause,
      ...(availability && {
        status: { [Op.iLike]: availability },
      }),
    };

    const vehicles = await Vehicle.findAll({
      where: whereClause,
      include: [
        {
          model: Model,
          as: 'model',
          required: !!(search || make || model?.length),
          attributes: ['name'],
          where: model?.length
            ? {
                name: { [Op.in]: model },
              }
            : undefined,
          include: [
            {
              model: Make,
              as: 'make',
              required: !!make,
              attributes: ['name'],
              where: make
                ? {
                    name: { [Op.iLike]: make },
                  }
                : undefined,
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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
              attributes: ['name', 'id'],
            },
          ],
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
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
      throw new createHttpError.NotFound('Vehicle not found.');
    }

    try {
      const vehicleData = {
        ...updateData,
        id,
        status: updateData.status ?? 'in stock',
      };

      const model = await Model.findByPk(updateData.model_id, {
        include: [{ model: Make, as: 'make' }],
      });

      if (!model) {
        throw new createHttpError.BadRequest('Model not found.');
      }

      const modelMake = await Make.findByPk(model.make_id);
      if (!modelMake) {
        throw new createHttpError.BadRequest('Make for model not found.');
      }

      if (typeof updateData.make_id === 'number' && model.make_id !== updateData.make_id) {
        throw new createHttpError.Conflict('Selected model does not belong to the specified make.');
      }

      await vehicle.update(vehicleData);
      return vehicle;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async assignCustomerWithData(
    vehicleId: string,
    customerData: CreateOrUpdateCustomerRequest
  ): Promise<{
    vehicle: Vehicle;
    message: string;
  }> {
    return await sequelize.transaction(async (t) => {
      const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t });
      if (!vehicle) {
        throw new createHttpError.NotFound('Vehicle not found');
      }

      const customer = await CustomerService.createOrUpdateCustomer(customerData, t);

      if (vehicle.customer_id && vehicle.customer_id !== customer.id) {
        throw new createHttpError.Conflict('Vehicle already assigned to another customer');
      }

      const isNew = vehicle.customer_id !== customer.id;

      await vehicle.update(
        {
          customer_id: customer.id,
          assignedDate: new Date(),
          status: 'sold',
        },
        { transaction: t }
      );

      const message = isNew
        ? 'Customer created and assigned successfully'
        : 'Customer updated and assigned successfully';

      return { vehicle, message };
    });
  }
}

export default new VehicleService();
