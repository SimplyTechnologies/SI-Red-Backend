import { Controller, Get, Route, Tags } from 'tsoa';
import AnalyticsService from '../services/AnalyticsService';

@Route('analytics')
@Tags('Analytics')
export class AnalyticsController extends Controller {
  @Get('/')
  public async getAnalyticsData(): Promise<{
    totalVehicles: number;
    totalCustomers: number;
    vehiclesSold: number;
  }> {
    return await AnalyticsService.getAnalyticsData();
  }
}