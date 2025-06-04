import { Vehicle } from '../models/Vehicle.model';
import { Customer } from '../models/Customer.model';

class AnalyticsService {
  public async getAnalyticsData(): Promise<{
    totalVehicles: number;
    totalCustomers: number;
    vehiclesSold: number;
  }> {
    const totalVehicles = await Vehicle.count();
    const totalCustomers = await Customer.count();
    const vehiclesSold = await Vehicle.count({ where: { status: 'sold' } });

    return {
      totalVehicles,
      totalCustomers,
      vehiclesSold,
    };
  }
}

export default new AnalyticsService();