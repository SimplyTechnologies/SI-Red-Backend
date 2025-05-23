import { Model } from '../models/Model.model';

class ModelService {
  async getAllModelsByMakeId(id: number) {
    const models = await Model.findAll({
      where: { make_id: id },
    });

    if (!models) {
      throw new Error('Models not found');
    }

    return models;
  }

  async getOrCreateModelIdByName(name: string, make_id: number): Promise<number> {
    let model = await Model.findOne({ where: { name, make_id } });

    if (!model) {
      model = await Model.create({ name, make_id });
    }

    return model.id;
  }
}

export default new ModelService();
