import axios from 'axios';
import MakeService from './MakeService';
import ModelService from './ModelService';
import { ParsedVehicleUpload } from '../types/upload';
import { Vehicle } from '../models';

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

    const makeName = result.Make.trim().toLowerCase();
    const formattedMakeName = makeName.charAt(0).toUpperCase() + makeName.slice(1);

    const modelName = result.Model.trim();
    const year = parseInt(result.ModelYear);
    const makeId = await MakeService.getOrCreateMakeId(makeName);
    const modelId = await ModelService.getOrCreateModelIdByName(modelName, makeId);

    return {
      vin: result.VIN,
      make: formattedMakeName,
      makeId,
      model: modelName,
      modelId,
      year: String(year),
    };
  }

  async validateVinData(
    vin: string,
    input: { make?: string; model?: string; year?: string }
  ): Promise<ParsedVehicleUpload> {
    let vinData = null;
    let vinError = null;

    const existing = await Vehicle.findOne({ where: { vin } });
    const vinExists = !!existing;

    try {
      vinData = await this.decodeVinAndCreateIfNotExists(vin);
    } catch {}

    const cleanedMake = input.make?.trim() || undefined;
    const cleanedModel = input.model?.trim() || undefined;
    const cleanedYear = input.year?.trim() || undefined;

    return {
      vin,
      make: cleanedMake || vinData?.make,
      model: cleanedModel || vinData?.model,
      year: cleanedYear || vinData?.year,
      coordinates: undefined,
      combinedLocation: undefined,
      error: vinError,
      vinExists,
    };
  }
}

export default new VinService();
