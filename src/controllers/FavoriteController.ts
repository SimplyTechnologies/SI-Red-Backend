import { Body, Controller, Get, Post, Delete, Route, Tags, Query } from 'tsoa';
import { VehicleAttributes } from '../types/vehicle';
import { FavoriteRequestBody } from '../types/favorite';
import FavoriteService from '../services/FavoriteService';
import { HttpError } from 'http-errors';

@Route('favorites')
@Tags('Favorite')
export class FavoriteController extends Controller {
  @Post('/')
  public async addToFavorites(@Body() body: FavoriteRequestBody): Promise<{ message: string }> {
    try {
      await FavoriteService.addToFavorites(body.user_id, body.vehicle_id);
      return { message: 'Vehicle added to favorites' };
    } catch (error) {
      if (error instanceof HttpError) this.setStatus(error.statusCode);
      throw error;
    }
  }

  @Delete('/')
  public async removeFromFavorites(
    @Query() user_id: string,
    @Query() vehicle_id: string
  ): Promise<{ message: string }> {
    try {
      await FavoriteService.removeFromFavorites(user_id, vehicle_id);
      return { message: 'Vehicle removed from favorites' };
    } catch (error) {
      if (error instanceof HttpError) this.setStatus(error.statusCode);
      throw error;
    }
  }

  @Get('/')
  public async getFavorites(@Query() user_id: string): Promise<VehicleAttributes[]> {
    try {
      return await FavoriteService.getFavoriteVehicles(user_id);
    } catch (error) {
      if (error instanceof HttpError) this.setStatus(error.statusCode);
      throw error;
    }
  }
}
