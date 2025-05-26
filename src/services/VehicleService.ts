import { Model } from '../models/Model.model';
import { Vehicle } from '../models/Vehicle.model';
import { Make } from '../models/Make.model';

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
    return await Vehicle.findAll({
      include: [
        {
          model: Model as typeof Model & { new (): Model }, // Type assertion
          as: 'model',
          attributes: ['name'],
          include: [
            {
              model: Make as typeof Make & { new (): Make }, // Type assertion
              as: 'make',
              attributes: ['name'],
            },
          ],
        },
      ],
    });
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
              attributes: ['name'],
            },
          ],
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
      throw new Error('Vehicle not found');
    }
    await vehicle.update(updateData);
    return vehicle;
  }
}

export default new VehicleService();
