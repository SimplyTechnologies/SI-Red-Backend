import { Vehicle } from '../models';

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
  status?: string;
  location?: string;
}

class VehicleService {
  async createVehicle(data: VehicleInput) {
    const vehicleData = {
      ...data,
      status: data.status ?? 'in stock',
      location: data.location ?? '',
    };

    return await Vehicle.create(vehicleData);
  }

  async getAllVehicles() {
    return await Vehicle.findAll();
  }

  async getVehicleById(id: string) {
    return await Vehicle.findByPk(id);
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
      throw new Error('Vehicle not found');
    }
    await vehicle.update(updateData);
    return vehicle;
  }
}

export default new VehicleService();
