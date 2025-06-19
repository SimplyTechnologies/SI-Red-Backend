export type ParsedVehicleUpload = {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  combinedLocation?: string;
  coordinates?: string;
  // exclude: boolean;
  mismatch?: {
    make?: { original: string; actual: string };
    model?: { original: string; actual: string };
    year?: { original: string; actual: string | undefined };
  };
  error?: string | null;
  vinExists: boolean;
};
