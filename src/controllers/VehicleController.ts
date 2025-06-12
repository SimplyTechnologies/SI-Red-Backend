import {
  Body,
  Controller,
  Post,
  Get,
  Path,
  Put,
  Delete,
  Route,
  Tags,
  SuccessResponse,
  Request,
  Query,
  Patch,
  Security,
} from 'tsoa';
import { stringify } from 'csv-stringify';
import { Options as StringifyOptions } from 'csv-stringify/sync';
import { Readable } from 'stream';
import VehicleService from '../services/VehicleService';
import { VehicleInput, VehicleMapPoint, VehicleResponse } from '../types/vehicle';
import { AuthenticatedRequest } from '../types/auth';
import { getUserIdOrThrow } from '../utils/auth';
import { LIMIT, PAGE } from '../constants/constants';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import { Middlewares } from 'tsoa';
import { customerValidationRules } from '../validations/customer.validation';
import { validateRequest } from '../middlewares/validateRequest';

@Route('vehicles')
@Tags('Vehicle')
export class VehicleController extends Controller {
  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createVehicle(
    @Request() req: AuthenticatedRequest,
    @Body() requestBody: VehicleInput
  ): Promise<VehicleResponse> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    const newVehicle = await VehicleService.createVehicle(requestBody, userId);
    this.setStatus(201);
    return newVehicle.get({ plain: true });
  }

  @Get('/')
  @Security('bearerAuth')
  public async getVehicles(
    @Request() req: AuthenticatedRequest,
    @Query() page: number = PAGE,
    @Query() limit: number = LIMIT,
    @Query() search?: string,
    @Query() make?: string,
    @Query() model?: string[],
    @Query() availability?: string
  ): Promise<VehicleResponse[]> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));

    const modelArray = model ? (Array.isArray(model) ? model : [model]) : undefined;

    return await VehicleService.getAllVehicles({
      userId,
      page,
      limit,
      search,
      make,
      model: modelArray,
      availability,
    });
  }

  @Get('/download-csv')
  public async downloadCSV(
    @Request() req: AuthenticatedRequest,
    @Query() search?: string,
    @Query() type?: 'vehicles' | 'favorites'
  ): Promise<NodeJS.ReadableStream> {
    try {
      const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
      
      // Get vehicles based on type
      const vehicles = type === 'favorites'
        ? await VehicleService.getVehiclesForCSV(search, userId, true)
        : await VehicleService.getVehiclesForCSV(search);

      const date = new Date().toISOString().split('T')[0];
      const prefix = type === 'favorites' ? 'favorite-vehicles' : 'vehicles';
      const filename = `${prefix}_${date}.csv`;

      this.setHeader('Content-Type', 'text/csv; charset=UTF-8');
      this.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      this.setHeader('Cache-Control', 'no-cache');
      this.setStatus(200);

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

      return Readable.from(vehicles).pipe(stringify(options));
    } catch (error) {
      console.error('Error generating CSV:', error);
      this.setStatus(500);
      throw new Error('Failed to generate CSV file');
    }
  }

  @Get('/map-points')
  public async getVehicleMapPoints(@Query() search?: string): Promise<VehicleMapPoint[]> {
    return await VehicleService.getVehicleMapPoints(search);
  }

  @Get('/{id}')
  public async getVehicle(@Path() id: string): Promise<VehicleResponse> {
    const vehicle = await VehicleService.getVehicleById(id);
    if (!vehicle) {
      this.setStatus(404);
      throw new Error('Vehicle not found');
    }
    return vehicle.get({ plain: true });
  }

  @Patch('/{id}')
  public async updateVehicle(
    @Path() id: string,
    @Body() updateData: Partial<VehicleInput>
  ): Promise<VehicleResponse> {
    const updated = await VehicleService.updateVehicle(id, updateData);
    return updated.get({ plain: true });
  }

  @Put('/{id}/assign-customer-with-data')
  @Middlewares([customerValidationRules, validateRequest])
  public async assignCustomerWithData(
    @Path() id: string,
    @Body() customerData: CreateOrUpdateCustomerRequest
  ): Promise<{ message: string; vehicle: VehicleResponse }> {
    const { vehicle, message } = await VehicleService.assignCustomerWithData(id, customerData);
    return {
      message,
      vehicle: vehicle.get({ plain: true }),
    };
  }

  @Delete('/{id}')
  public async deleteVehicle(@Path() id: string): Promise<{ message: string }> {
    return await VehicleService.deleteVehicle(id);
  }

  private escapeCsvValue(value: string): string {
    if (!value) return '""';
    const needsQuoting = value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r');
    if (!needsQuoting) return value;
    return `"${value.replace(/"/g, '""')}"`;
  }
}