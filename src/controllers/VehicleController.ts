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
} from "tsoa";
import VehicleService from "../services/VehicleService";

interface VehicleInput {
  model_id: number;
  year: string;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  user_id: string;
}

interface VehicleResponse {
  id: string;
  model_id: number;
  year: string;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  user_id: string;
}

@Route("vehicles")
@Tags("Vehicle")
export class VehicleController extends Controller {
  @Post("/")
  @SuccessResponse("201", "Created")
  public async createVehicle(
    @Body() requestBody: VehicleInput
  ): Promise<VehicleResponse> {
    const newVehicle = await VehicleService.createVehicle(requestBody);
    this.setStatus(201);
    return newVehicle;
  }

  @Get("/")
  public async getVehicles(): Promise<VehicleResponse[]> {
    const vehicles = await VehicleService.getAllVehicles();
    return vehicles.map((v: any) => v.get({ plain: true }));
  }

  @Get("/{id}")
  public async getVehicle(@Path() id: number): Promise<VehicleResponse> {
    const vehicle = await VehicleService.getVehicleById(id);
    if (!vehicle) {
      this.setStatus(404);
      throw new Error("Vehicle not found");
    }
    return vehicle.get({ plain: true });
  }

  @Put("/{id}")
  public async updateVehicle(
    @Path() id: number,
    @Body() updateData: Partial<VehicleInput>
  ): Promise<VehicleResponse> {
    const updated = await VehicleService.updateVehicle(id, updateData);
    return updated.get({ plain: true });
  }

  @Delete("/{id}")
  public async deleteVehicle(@Path() id: number): Promise<{ message: string }> {
    return await VehicleService.deleteVehicle(id);
  }
}
