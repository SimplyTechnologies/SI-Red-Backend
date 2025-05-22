import { Vehicle } from "../models/Vehicle.model";

export interface VehicleInput {
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

class VehicleService {
  async createVehicle(data: VehicleInput) {
    return await Vehicle.create(data);
  }

  async getAllVehicles() {
    return await Vehicle.findAll();
  }

  async getVehicleById(id: number) {
    return await Vehicle.findByPk(id);
  }

  async deleteVehicle(id: number) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    await vehicle.destroy();
    return { message: "Vehicle deleted successfully" };
  }

  async updateVehicle(id: number, updateData: Partial<VehicleInput>) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    await vehicle.update(updateData);
    return vehicle;
  }
}

export default new VehicleService();
