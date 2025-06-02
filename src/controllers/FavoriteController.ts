import { Body, Controller, Get, Post, Delete, Route, Tags, Query, Request } from 'tsoa';
import { VehicleAttributes } from '../types/vehicle';
import { AuthenticatedRequest } from '../types/auth';
import FavoriteService from '../services/FavoriteService';
import { getUserIdOrThrow } from '../utils/auth';

@Route('favorites')
@Tags('Favorite')
export class FavoriteController extends Controller {
  @Post('/')
  public async addToFavorites(
    @Request() req: AuthenticatedRequest,
    @Body() body: { vehicle_id: string }
  ): Promise<{ message: string }> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    await FavoriteService.addToFavorites(userId, body.vehicle_id);
    return { message: 'Vehicle added to favorites' };
  }

  @Delete('/')
  public async removeFromFavorites(
    @Request() req: AuthenticatedRequest,
    @Query() vehicle_id: string
  ): Promise<{ message: string }> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    await FavoriteService.removeFromFavorites(userId, vehicle_id);
    return { message: 'Vehicle removed from favorites' };
  }

  @Get('/')
  public async getFavorites(@Request() req: AuthenticatedRequest): Promise<VehicleAttributes[]> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    return await FavoriteService.getFavoriteVehicles(userId);
  }
}
