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
import VehicleService from '../services/VehicleService';
import { VehicleInput, VehicleMapPoint, VehicleResponse } from '../types/vehicle';
import { AuthenticatedRequest } from '../types/auth';
import { getUserIdOrThrow } from '../utils/auth';
import { LIMIT, PAGE } from '../constants/constants';
import { CreateOrUpdateCustomerRequest } from '../types/customer';
import { Middlewares } from 'tsoa';
import { customerValidationRules } from '../validations/customer.validation';
import { validateRequest } from '../middlewares/validateRequest';
import { ParsedVehicleUpload } from '../types/upload';
import { upload } from '../middlewares/multerMiddleware';
import VinService from '../services/VinService';

@Route('vehicles')
@Tags('Vehicle')
@Security('bearerAuth')
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
      const { stream, filename } = await VehicleService.generateCSVStream(search, userId, type);

      this.setHeader('Content-Type', 'text/csv; charset=UTF-8');
      this.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      this.setHeader('Cache-Control', 'no-cache');
      this.setStatus(200);

      return stream;
    } catch (error) {
      console.error('Error downloading CSV:', error);
      this.setStatus(500);
      throw error;
    }
  }

  @Get('/map-points')
  public async getVehicleMapPoints(@Query() search?: string): Promise<VehicleMapPoint[]> {
    return await VehicleService.getVehicleMapPoints(search);
  }

  @Get('/validate-make-model')
  public async validateMakeModel(
    @Query() makeName: string,
    @Query() modelName: string
  ): Promise<{ makeMsg: string; modelMsg: string }> {
    return VehicleService.validateMakeAndModel(makeName, modelName);
  }

  @Get('/validate-vin')
  public async validateVin(
    @Query() vin: string,
    @Query() make?: string,
    @Query() model?: string,
    @Query() year?: string
  ): Promise<ParsedVehicleUpload> {
    if (!vin || vin.length !== 17) {
      this.setStatus(400);
      throw new Error('VIN must be 17 characters long');
    }

    const result = await VinService.validateVinData(vin, { make, model, year });
    return result;
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

  @Post('/upload-csv-preview')
  @Middlewares([upload.single('file')])
  @SuccessResponse('200', 'Parsed and validated')
  public async uploadCSVPreview(@Request() req: Express.Request): Promise<ParsedVehicleUpload[]> {
    const file = req.file;
    if (!file) throw new Error('File is required');
    return await VehicleService.parseAndValidateCSV(file.buffer);
  }
}
