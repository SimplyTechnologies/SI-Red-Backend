import {
  GetVehiclesOptions,
  VehicleInput,
  VehicleResponse,
  VehicleCSVData,
  PlainVehicleLocation,
  BulkVehicleInput,
} from '../types/vehicle';
import { Vehicle, Model, Make, Customer, VehicleImage } from '../models';
import FavoriteService from './FavoriteService';
import { Op, Sequelize, UniqueConstraintError } from 'sequelize';
import CustomerService from './CustomerService';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import { sequelize } from '../config/db';
import createHttpError from 'http-errors';
import { Readable, PassThrough } from 'stream';
import { stringify } from 'csv-stringify';
import { Options as StringifyOptions } from 'csv-stringify/sync';
import DocumentService from './DocumentService'; // Add this import

import { ParsedVehicleUpload } from '../types/upload';
import GeoService from './GeoService';
import VinService from './VinService';
import { parse } from 'csv-parse/sync';
import { normalizeName } from '../utils/normalizers';
import cloudinary from '../config/cloudinary';
import { extractPublicIdFromUrl } from '../utils/cloudinary';

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
      ...(availability && {
        status: { [Op.iLike]: availability },
      }),
    };

    const vehicles = await Vehicle.findAll({
      include: [
        {
          model: Model,
          as: 'model',
          required: true,
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
              required: true,
              attributes: ['name'],
              where: make
                ? {
                    name: { [Op.iLike]: make },
                  }
                : undefined,
            },
          ],
        },
        {
          model: VehicleImage,
          as: 'images',
          attributes: ['id', 'image_url'],
        },
      ],
      ...(searchClause && { where: { ...whereClause, ...searchClause } }),
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

  async getVehicleMapPoints({
    search,
    make,
    model,
    availability,
  }: Pick<GetVehiclesOptions, 'search' | 'make' | 'model' | 'availability'>) {
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
      attributes: ['id', 'location'],
      where: whereClause,
      include: [
        {
          model: Model,
          as: 'model',
          required: !!(search || make || model?.length),
          attributes: [],
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
              attributes: [],
              where: make
                ? {
                    name: { [Op.iLike]: make },
                  }
                : undefined,
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
        {
          model: VehicleImage,
          as: 'images',
          attributes: ['id', 'image_url'],
        },
      ],
    });
  }

  async deleteVehicle(id: string) {
    const vehicle = await Vehicle.findByPk(id, {
      include: [{ model: VehicleImage, as: 'images' }],
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const typedVehicle = vehicle as Vehicle & { images?: VehicleImage[] };

    if (typedVehicle.images && typedVehicle.images.length > 0) {
      for (const img of typedVehicle.images) {
        const publicId = extractPublicIdFromUrl(img.image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error(`❌ Failed to delete Cloudinary image ${publicId}`, error);
          }
        }
      }
    }

    await VehicleImage.destroy({ where: { vehicle_id: id } });

    await vehicle.destroy();

    return { message: 'Vehicle and associated images deleted successfully' };
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
  {
    customerData,
    documents,
  }: {
    customerData: CreateOrUpdateCustomerRequest;
    documents?: Express.Multer.File[];
  }
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

    // --- Handle document uploads ---
    if (documents && documents.length > 0) {
      for (const file of documents) {
        await DocumentService.uploadDocument(
          file,
          {
            customerId: customer.id,
            vehicleId: vehicle.id,
            // Optionally, pass category if you want
          },
          t
        );
      }
    }
    // --- End document uploads ---

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
  async getVehiclesForCSV(
    search?: string,
    make?: string,
    model?: string[],
    availability?: string,
    userId?: string,
    isFavorites = false
  ): Promise<VehicleCSVData[]> {
    try {
      const whereClause = search ? this.getWhereClauseSearch(search) : {};
      let favoriteIds: Set<string> = new Set();

      if (isFavorites && userId) {
        favoriteIds = await FavoriteService.getFavoriteVehicleIds(userId);
        if (favoriteIds.size === 0)
          throw new createHttpError.NotFound('No favorite vehicles found');
      }

      const vehicles = await Vehicle.findAll({
        where: {
          ...whereClause,
          ...(availability && { status: availability }),
          ...(isFavorites &&
            favoriteIds.size > 0 && {
              id: { [Op.in]: Array.from(favoriteIds) },
            }),
        },
        include: [
          {
            model: Model,
            as: 'model',
            required: !!search || !!model || !!make,
            attributes: ['name'],
            where: {
              ...(model && {
                name: Array.isArray(model) ? { [Op.in]: model } : model,
              }),
            },
            include: [
              {
                model: Make,
                as: 'make',
                required: !!make,
                attributes: ['name'],
                where: make ? { name: make } : undefined,
              },
            ],
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

      return vehicles.map((vehicle) => {
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
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
        return 'In Stock';
      case 'sold':
        return 'Sold';
      default:
        return 'Unknown';
    }
  }

  async generateCSVStream(
    search?: string,
    make?: string,
    model?: string[],
    availability?: string,
    userId?: string,
    type?: 'vehicles' | 'favorites'
  ): Promise<{
    stream: NodeJS.ReadableStream;
    filename: string;
  }> {
    try {
      const vehicles =
        type === 'favorites'
          ? await this.getVehiclesForCSV(search, make, model, availability, userId, true)
          : await this.getVehiclesForCSV(search, make, model, availability);

      const date = new Date().toISOString().split('T')[0];
      const prefix = type === 'favorites' ? 'favorite-vehicles' : 'vehicles';
      const filename = `${prefix}_${date}.csv`;

      // Create metadata lines
      const filters: string[] = [];
      if (make) filters.push(`Make: ${make}`);
      if (model?.length) filters.push(`Model: ${model.join(', ')}`);
      if (availability) filters.push(`Status: ${availability}`);
      if (search) filters.push(`Search: "${search}"`);

      const filteredLine =
        filters.length > 0 ? `Filtered by: ${filters.join('; ')}` : 'Filtered by: None';
      const exportedLine = `Exported at: ${new Date().toLocaleString()}`;

      // Create header stream manually
      const headerStream = new PassThrough();
      headerStream.write(`"${filteredLine}"\n`);
      headerStream.write(`"${exportedLine}"\n`);
      headerStream.write('\n'); // Blank line
      headerStream.end();

      // Setup CSV options
      const options: StringifyOptions = {
        header: true,
        columns: [
          { key: 'make', header: 'Make' },
          { key: 'model', header: 'Model' },
          { key: 'vin', header: 'VIN' },
          { key: 'year', header: 'Year' },
          { key: 'combinedLocation', header: 'Location' },
          { key: 'location', header: 'Coordinates' },
          { key: 'availability', header: 'Status' },
        ],
        cast: {
          string: (value: unknown): string =>
            typeof value === 'string' ? value.replace(/"/g, '""') : String(value),
        },
        quoted: true,
        quoted_empty: true,
        record_delimiter: '\n',
      };

      const dataStream = Readable.from(vehicles).pipe(stringify(options));

      // Combine both header and data streams
      const combinedStream = new PassThrough();
      headerStream.pipe(combinedStream, { end: false });
      headerStream.on('end', () => {
        dataStream.pipe(combinedStream);
      });

      return { stream: combinedStream, filename };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to generate CSV file:', {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }
      throw new createHttpError.InternalServerError('Failed to generate CSV file');
    }
  }
  async parseAndValidateCSV(buffer: Buffer): Promise<ParsedVehicleUpload[]> {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results: ParsedVehicleUpload[] = [];

    for (const record of records) {
      const vin = record['VIN'];
      const input = {
        make: record['Make'],
        model: record['Model'],
        year: record['Year'],
        combinedLocation: record['Combined Location'],
        coordinates: record['Coordinates'],
      };

      let vinData = null;
      let vinError = null;
      const existing = await Vehicle.findOne({ where: { vin } });
      const vinExists = !!existing;

      try {
        vinData = await VinService.decodeVinAndCreateIfNotExists(vin);
      } catch (err) {
        vinError = (err as Error).message ?? 'VIN lookup failed';
      }

      let coordinates = input.coordinates;
      let combinedLocation = input.combinedLocation;

      if (!coordinates && combinedLocation) {
        coordinates = await GeoService.getCoordinatesFromAddress(combinedLocation);
      } else if (!combinedLocation && coordinates) {
        const [lat, lng] = coordinates.split(',');
        combinedLocation = await GeoService.getAddressFromCoordinates(
          parseFloat(lat),
          parseFloat(lng)
        );
      }

      results.push({
        vin,
        make: input.make?.trim() || vinData?.make,
        model: input.model?.trim() || vinData?.model,
        year: input.year?.trim() || vinData?.year,
        coordinates,
        combinedLocation,
        error: vinError,
        vinExists,
      });
    }

    return results;
  }

  async validateMakeAndModel(
    makeName: string,
    modelName: string
  ): Promise<{
    makeMsg: string;
    modelMsg: string;
  }> {
    let makeMsg = '';
    let modelMsg = '';
    const normalizedMake = normalizeName(makeName);
    const normalizedModel = normalizeName(modelName);

    const make = await Make.findOne({
      where: {
        name: {
          [Op.iLike]: normalizedMake,
        },
      },
    });

    if (!make) {
      makeMsg = 'Make not found';
      modelMsg = 'Cannot validate model without a valid make';
      return { makeMsg, modelMsg };
    }

    const model = await Model.findOne({
      where: {
        name: {
          [Op.iLike]: normalizedModel,
        },
        make_id: make.id,
      },
    });

    if (!model) {
      modelMsg = 'Model does not match the specified make';
    }

    return { makeMsg, modelMsg };
  }

  async bulkCreateVehicles(data: BulkVehicleInput[], userId: string) {
    const vehiclesToCreate = [];

    for (const row of data) {
      const { make, model, vin, year, coordinates, combinedLocation } = row;

      if (!make || !model || !vin || !year || !coordinates || !combinedLocation) {
        throw new createHttpError.BadRequest('Missing required vehicle fields.');
      }

      const foundMake = await Make.findOne({
        where: { name: { [Op.iLike]: make } },
      });

      if (!foundMake) {
        throw new createHttpError.BadRequest(`Make '${make}' not found.`);
      }

      const foundModel = await Model.findOne({
        where: {
          name: { [Op.iLike]: model },
          make_id: foundMake.id,
        },
      });

      if (!foundModel) {
        throw new createHttpError.BadRequest(
          `Model '${model}' not found or does not belong to make '${make}'.`
        );
      }

      const street = combinedLocation;
      const city = '';
      const state = '';
      const country = '';
      const zipcode = '';

      vehiclesToCreate.push({
        model_id: foundModel.id,
        vin,
        year,
        user_id: userId,
        street,
        city,
        state,
        country,
        zipcode,
        status: 'in stock',
        location: coordinates,
        imported: true,
      });
    }

    return await Vehicle.bulkCreate(vehiclesToCreate);
  }
}

export default new VehicleService();
