import { query } from "express-validator";

export const vehicleValidationRules = [
  query("vin")
    .isLength({ min: 17, max: 17 })
    .withMessage("VIN must be exactly 17 characters long")
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage("VIN contains invalid characters"),
];
