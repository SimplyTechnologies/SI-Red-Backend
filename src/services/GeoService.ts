import axios from 'axios';

class GeoService {
  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    return data.results?.[0]?.formatted_address || '';
  }

  async getCoordinatesFromAddress(address: string): Promise<string> {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    const loc = data.results?.[0]?.geometry?.location;
    return loc ? `${loc.lat},${loc.lng}` : '';
  }
}

export default new GeoService();
