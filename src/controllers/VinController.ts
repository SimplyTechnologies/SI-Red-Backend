import { Controller, Get, Route, Tags, Query } from 'tsoa';
import VinService from '../services/VinService';
import { VinResponse } from '../types/vin';

@Route('vin')
@Tags('VIN')
export class VinController extends Controller {
  @Get('/')
  public async decodeVin(@Query() vin: string): Promise<VinResponse> {
    return await VinService.decodeVin(vin);
  }
}
