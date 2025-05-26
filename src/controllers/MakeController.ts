import { Controller, Get, Route, Tags, Path, Query } from 'tsoa';
import MakeService from '../services/MakeService';
import { Make } from '../models/Make.model';
import { MakeResponse } from '../types/make';

@Route('makes')
@Tags('Make')
export class MakeController extends Controller {
  @Get('/')
  public async getAllMakes(): Promise<MakeResponse[]> {
    const makes = await MakeService.getAllMakes();
    return makes.map((make: Make) => make.get({ plain: true }));
  }

  @Get('/find-or-create-make')
  public async getOrCreateMakeId(@Query() name: string): Promise<{ make_id: number }> {
    if (!name) {
      this.setStatus(400);
      throw new Error("Missing 'name' query parameter");
    }

    const id = await MakeService.getOrCreateMakeId(name);
    return { make_id: id };
  }

  @Get('/{id}')
  public async getMakeById(@Path() id: number): Promise<MakeResponse> {
    const make = await MakeService.getMakeById(id);
    return make.get({ plain: true });
  }
}
