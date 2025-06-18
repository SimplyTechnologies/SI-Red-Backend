import axios from 'axios';
import MakeService from './MakeService';
import ModelService from './ModelService';

class VinService {
  async decodeVinAndCreateIfNotExists(vin: string) {
    if (vin === '') {
      throw new Error('Invalid VIN or no data found');
    }
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );

    const result = response.data?.Results?.[0];

    if (!result || !result.Make || !result.Model || result.ErrorCode !== '0') {
      throw new Error('Invalid VIN or no data found');
    }

    const makeName = result.Make.trim();
    const modelName = result.Model.trim();
    const year = parseInt(result.ModelYear);
    const makeId = await MakeService.getOrCreateMakeId(makeName);
    const modelId = await ModelService.getOrCreateModelIdByName(modelName, makeId);

    return {
      vin: result.VIN,
      make: makeName,
      makeId,
      model: modelName,
      modelId,
      year: String(year),
    };
  }
}

export default new VinService();
