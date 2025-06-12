import { GetVehiclesOptions, VehicleInput, VehicleResponse, VehicleCSVData } from '../types/vehicle';
import { Vehicle, Model, Make, Customer } from '../models';
import FavoriteService from './FavoriteService';
import { Op, Sequelize, UniqueConstraintError } from 'sequelize';
import CustomerService from './CustomerService';
import createError from 'http-errors';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import { sequelize } from '../config/db';
import createHttpError from 'http-errors';

interface PlainVehicleLocation {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}
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
        throw new createHttpError.Conflict(
          'Selected model does not belong to the specified make.'
        );
      }

      return await Vehicle.create(vehicleData);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new createHttpError.Conflict('VIN already exists.');
      }
      console.error('Error creating vehicle:', err);
      throw err;
    }
  }

  async getAllVehicles({ userId, page, limit, search }: GetVehiclesOptions) {
    try {
      const offset = (page - 1) * limit;
      const favoriteIds = userId 
        ? await FavoriteService.getFavoriteVehicleIds(userId) 
        : new Set();
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
        order: [['createdAt', 'DESC']],
      });

      return vehicles.map((vehicle): VehicleResponse => {
        const plain = vehicle.get({ plain: true }) as Omit<VehicleResponse, 'isFavorite'>;
        return {
          ...plain,
          isFavorite: favoriteIds.has(vehicle.id),
        };
      });
    } catch (error: unknown) {
      this.handleError(error, 'Error fetching vehicles');
    }
  }

  async getVehicleMapPoints(search?: string) {
    try {
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
    } catch (error: unknown) {
      this.handleError(error, 'Error fetching vehicle map points');
    }
  }

  async getVehicleById(id: string) {
    try {
      const vehicle = await Vehicle.findByPk(id, {
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
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
          },
        ],
      });

      if (!vehicle) {
        throw new createError.NotFound('Vehicle not found');
      }

      return vehicle;
    } catch (error: unknown) {
      this.handleError(error, 'Error fetching vehicle by ID');
    }
  }

  async deleteVehicle(id: string) {
    try {
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        throw new createError.NotFound('Vehicle not found');
      }
      await vehicle.destroy();
      return { message: 'Vehicle deleted successfully' };
    } catch (error: unknown) {
      this.handleError(error, 'Error deleting vehicle');
    }
  }

  async updateVehicle(id: string, updateData: Partial<VehicleInput>) {
    try {
      const vehicle = await Vehicle.findByPk(id);
      if (!vehicle) {
        throw new createError.NotFound('Vehicle not found');
      }
      await vehicle.update(updateData);
      return vehicle;
    } catch (error: unknown) {
      this.handleError(error, 'Error updating vehicle');
    }
  }

  async assignCustomerWithData(
    vehicleId: string,
    customerData: CreateOrUpdateCustomerRequest
  ): Promise<{
    vehicle: Vehicle;
    message: string;
  }> {
    try {
      return await sequelize.transaction(async (t) => {
        const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t });
        if (!vehicle) {
          throw new createError.NotFound('Vehicle not found');
        }

        const customer = await CustomerService.createOrUpdateCustomer(customerData, t);

        if (vehicle.customer_id && vehicle.customer_id !== customer.id) {
          throw new createError.Conflict('Vehicle already assigned to another customer');
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
    } catch (error: unknown) {
      this.handleError(error, 'Error assigning customer to vehicle');
    }
  }


async getVehiclesForCSV(search?: string, userId?: string, isFavorites: boolean = false): Promise<VehicleCSVData[]> {
  try {
    const whereClause = search ? this.getWhereClauseSearch(search) : {};

    // Get favorite vehicle IDs if needed
    let favoriteIds: Set<string> = new Set();
    if (isFavorites && userId) {
      favoriteIds = await FavoriteService.getFavoriteVehicleIds(userId);
      if (favoriteIds.size === 0) {
        throw new createError.NotFound('No favorite vehicles found');
      }
    }

    const vehicles = await Vehicle.findAll({
      where: {
        ...whereClause,
        ...(isFavorites && favoriteIds.size > 0 && {
          id: { [Op.in]: Array.from(favoriteIds) }
        }),
      },
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
      attributes: [
        'vin',
        'year',
        'street',
        'city',
        'state',
        'country',
        'location',
        'status'
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!vehicles.length) {
      throw new createError.NotFound(
        isFavorites ? 'No favorite vehicles found' : 'No vehicles found matching the criteria'
      );
    }

    return vehicles.map(vehicle => {
      const plain = vehicle.get({ plain: true });
      const locationParts = this.getFormattedLocationParts(plain);
      const combinedLocation = this.formatLocationString(locationParts);

      return {
        make: this.formatField(plain.model?.make?.name, 'Unknown Make'),
        model: this.formatField(plain.model?.name, 'Unknown Model'),
        vin: this.formatField(plain.vin, 'N/A'),
        year: this.formatField(plain.year, 'N/A'),
        combinedLocation: this.formatField(combinedLocation, 'No location provided'),
        location: this.formatField(plain.location, 'No coordinates'),
        availability: this.getAvailabilityStatus(plain.status)
      };
    });
  } catch (error: unknown) {
    this.handleError(error, 'Error generating CSV data');
  }
}

private getFormattedLocationParts(plain: PlainVehicleLocation): string[] {
  return [
    plain.street,
    plain.city,
    plain.state,
    plain.country
  ].filter((part): part is string => typeof part === 'string' && part.trim() !== '');
}

  private formatLocationString(parts: string[]): string {
    return parts.length > 0 ? parts.join(', ') : '';
  }

  private formatField(value: string | null | undefined, defaultValue: string): string {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return defaultValue;
    }
    return value.trim();
  }

  private getAvailabilityStatus(status: string | undefined): string {
    if (!status) return 'Unknown';
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'Available';
      case 'sold':
        return 'Not Available';
      default:
        return 'Unknown';
    }
  }

  private handleError(error: unknown, context: string): never {
    const errorContext = {
      service: 'VehicleService',
      context,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof createError.HttpError) {
      console.error('HTTP Error:', {
        ...errorContext,
        statusCode: error.statusCode,
        message: error.message,
      });
      throw error;
    }

    if (error instanceof Error) {
      console.error('Error:', {
        ...errorContext,
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      if (process.env.NODE_ENV === 'development') {
        console.debug('Detailed error information:', {
          error,
          context: errorContext,
        });
      }
    } else {
      console.error('Unknown error:', {
        ...errorContext,
        error,
      });
    }

    throw new createError.InternalServerError(
      `${context}: An unexpected error occurred`
    );
  }
}

export default new VehicleService();