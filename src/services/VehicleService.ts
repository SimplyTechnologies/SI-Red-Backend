import { GetVehiclesOptions, VehicleInput, VehicleResponse, VehicleCSVData,
  PlainVehicleLocation  } from '../types/vehicle';
import { Vehicle, Model, Make, Customer } from '../models';
import FavoriteService from './FavoriteService';
import { Op, Sequelize, UniqueConstraintError } from 'sequelize';
import CustomerService from './CustomerService';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import { sequelize } from '../config/db';
import createHttpError from 'http-errors';
import { Readable } from 'stream';
import { stringify } from 'csv-stringify';
import { Options as StringifyOptions } from 'csv-stringify/sync';

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
    async getVehiclesForCSV(search?: string, userId?: string, isFavorites = false): Promise<VehicleCSVData[]> {
    try {
      const whereClause = search ? this.getWhereClauseSearch(search) : {};
      let favoriteIds: Set<string> = new Set();

      if (isFavorites && userId) {
        favoriteIds = await FavoriteService.getFavoriteVehicleIds(userId);
        if (favoriteIds.size === 0) throw new createHttpError.NotFound('No favorite vehicles found');
      }

      const vehicles = await Vehicle.findAll({
        where: {
          ...whereClause,
          ...(isFavorites && favoriteIds.size > 0 && {
            id: { [Op.in]: Array.from(favoriteIds) },
          }),
        },
        include: [
          {
            model: Model,
            as: 'model',
            required: !!search,
            attributes: ['name'],
            include: [{ model: Make, as: 'make', required: false, attributes: ['name'] }],
          },
        ],
        attributes: ['vin', 'year', 'street', 'city', 'state', 'country', 'location', 'status'],
        order: [['createdAt', 'DESC']],
      });

      if (!vehicles.length) {
        throw new createHttpError.NotFound(
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
          availability: this.getAvailabilityStatus(plain.status),
        };
      });
    } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating CSV data:', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    
    throw new createHttpError.InternalServerError('Error generating CSV data');
  }
  }

  private getFormattedLocationParts(plain: PlainVehicleLocation): string[] {
    return [plain.street, plain.city, plain.state, plain.country].filter(
      (part): part is string => typeof part === 'string' && part.trim() !== ''
    );
  }

  private formatLocationString(parts: string[]): string {
    return parts.length > 0 ? parts.join(', ') : '';
  }

  private formatField(value: string | null | undefined, defaultValue: string): string {
    return !value || value.trim() === '' ? defaultValue : value.trim();
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

  async generateCSVStream(search?: string, userId?: string, type?: 'vehicles' | 'favorites'): Promise<{
    stream: NodeJS.ReadableStream;
    filename: string;
  }> {
    try {
      const vehicles = type === 'favorites'
        ? await this.getVehiclesForCSV(search, userId, true)
        : await this.getVehiclesForCSV(search);

      const date = new Date().toISOString().split('T')[0];
      const prefix = type === 'favorites' ? 'favorite-vehicles' : 'vehicles';
      const filename = `${prefix}_${date}.csv`;

      const options: StringifyOptions = {
        header: true,
        columns: [
          { key: 'make', header: 'Make' },
          { key: 'model', header: 'Model' },
          { key: 'vin', header: 'VIN' },
          { key: 'year', header: 'Year' },
          { key: 'combinedLocation', header: 'Combined Location' },
          { key: 'location', header: 'Coordinates' },
          { key: 'availability', header: 'Availability' }
        ],
        cast: {
          string: (value: unknown): string => 
            typeof value === 'string' ? value.replace(/"/g, '""') : String(value)
        },
        quoted: true,
        quoted_empty: true,
        record_delimiter: '\n'
      };

      const stream = Readable.from(vehicles).pipe(stringify(options));
      return { stream, filename };
    } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to generate CSV file:', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    throw new createHttpError.InternalServerError('Failed to generate CSV file');
  }
}
}


export default new VehicleService();