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
} from 'tsoa';
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
  public async getVehicles(
    @Request() req: AuthenticatedRequest,
    @Query() page: number = PAGE,
    @Query() limit: number = LIMIT,
    @Query() search?: string
  ): Promise<VehicleResponse[]> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    return await VehicleService.getAllVehicles({ userId, page, limit, search });
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
}
