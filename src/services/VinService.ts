import axios from 'axios';

class VinService {
  async decodeVin(vin: string) {
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );

    const result = response.data?.Results?.[0];

    if (!result || result.Make === '') {
      throw new Error('Invalid VIN or no data found');
    }

    return {
      vin: result.VIN,
      make: result.Make,
      model: result.Model,
      year: result.ModelYear,
    };
  }
}

export default new VinService();
