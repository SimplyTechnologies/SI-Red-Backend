import { Body, Controller, Get, Post, Delete, Route, Tags, Query } from 'tsoa';
import { VehicleAttributes } from '../models/Vehicle.model';
import FavoriteService from '../services/FavoriteService';

interface FavoriteRequestBody {
  user_id: string;
  vehicle_id: string;
}

@Route('favorites')
@Tags('Favorite')
export class FavoriteController extends Controller {
  @Post('/')
  public async addToFavorites(@Body() body: FavoriteRequestBody): Promise<{ message: string }> {
    await FavoriteService.addToFavorites(body.user_id, body.vehicle_id);
    return { message: 'Vehicle added to favorites' };
  }

  @Delete('/')
  public async removeFromFavorites(
    @Body() body: FavoriteRequestBody
  ): Promise<{ message: string }> {
    await FavoriteService.removeFromFavorites(body.user_id, body.vehicle_id);
    return { message: 'Vehicle removed from favorites' };
  }

  @Get('/')
  public async getFavorites(@Query() user_id: string): Promise<VehicleAttributes[]> {
    return await FavoriteService.getFavoriteVehicles(user_id);
  }
}
