export type ParsedVehicleUpload = {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  combinedLocation?: string;
  coordinates?: string;
  error?: string | null;
  vinExists?: boolean;
};
