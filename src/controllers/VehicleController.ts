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
  Query,
} from 'tsoa';
import VehicleService from '../services/VehicleService';
import { VehicleInput, VehicleResponse } from '../types/vehicle';

@Route('vehicles')
@Tags('Vehicle')
export class VehicleController extends Controller {
  @Post('/')
  @SuccessResponse('201', 'Created')
  public async createVehicle(@Body() requestBody: VehicleInput): Promise<VehicleResponse> {
    const newVehicle = await VehicleService.createVehicle(requestBody);
    this.setStatus(201);
    return newVehicle.get({ plain: true });
  }

  @Get('/')
  public async getVehicles(@Query() userId?: string): Promise<VehicleResponse[]> {
    return await VehicleService.getAllVehicles(userId);
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

  @Put('/{id}')
  public async updateVehicle(
    @Path() id: string,
    @Body() updateData: Partial<VehicleInput>
  ): Promise<VehicleResponse> {
    const updated = await VehicleService.updateVehicle(id, updateData);
    return updated.get({ plain: true });
  }

  @Delete('/{id}')
  public async deleteVehicle(@Path() id: string): Promise<{ message: string }> {
    return await VehicleService.deleteVehicle(id);
  }
}
