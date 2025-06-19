import { Make } from '../models';
import { normalizeName } from '../utils/normalizers';

class MakeService {
  async getAllMakes() {
    return await Make.findAll();
  }

  async getOrCreateMakeId(name: string): Promise<number> {
    const normalizedName = normalizeName(name);

    let make = await Make.findOne({ where: { name: normalizedName } });

    if (!make) {
      make = await Make.create({ name: normalizedName });
    }

    return make.id;
  }

  async getMakeById(id: number) {
    const make = await Make.findByPk(id);
    if (!make) {
      throw new Error('Make not found');
    }
    return make;
  }
}

export default new MakeService();
