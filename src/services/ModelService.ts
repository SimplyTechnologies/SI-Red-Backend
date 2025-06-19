import { Model } from '../models';
import { normalizeName } from '../utils/normalizers';

class ModelService {
  async getAllModelsByMakeId(id: number) {
    const models = await Model.findAll({ where: { make_id: id } });
    return models;
  }

  async getOrCreateModelIdByName(name: string, make_id: number): Promise<number> {
    const normalizedName = normalizeName(name);

    let model = await Model.findOne({ where: { name: normalizedName, make_id } });

    if (!model) {
      model = await Model.create({ name: normalizedName, make_id });
    }

    return model.id;
  }
}

export default new ModelService();
