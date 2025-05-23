import { Make } from '../models/Make.model';

class MakeService {
  async getAllMakes() {
    return await Make.findAll();
  }

  async getOrCreateMakeId(name: string): Promise<number> {
    let make = await Make.findOne({ where: { name } });

    if (!make) {
      make = await Make.create({ name });
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
