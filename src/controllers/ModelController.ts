import { Controller, Get, Query, Route, Tags, Path } from 'tsoa';
import ModelService from '../services/ModelService';
import { ModelResponse } from '../types/model';

@Route('models')
@Tags('Model')
export class ModelController extends Controller {
  @Get('bymake/{id}')
  public async getAllModelsByMakeId(@Path() id: number): Promise<ModelResponse[]> {
    const models = await ModelService.getAllModelsByMakeId(id);
    const plainModels = models.map((model) => model.get({ plain: true }));

    return plainModels;
  }

  @Get('/find-or-create-model')
  public async getOrCreateModelId(
    @Query() name: string,
    @Query() make_id: number
  ): Promise<{ model_id: number }> {
    if (!name || !make_id) {
      this.setStatus(400);
      throw new Error("Missing 'name' or 'make_id' query parameter");
    }

    const id = await ModelService.getOrCreateModelIdByName(name, make_id);
    return { model_id: id };
  }
}
