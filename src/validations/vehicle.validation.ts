import { query } from 'express-validator';

export const vehicleValidationRules = [
  query('vin')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters long')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('VIN contains invalid characters'),

  query('street').trim().notEmpty().withMessage('Street is required'),

  query('city').trim().notEmpty().withMessage('City is required'),

  query('state').trim().notEmpty().withMessage('State is required'),

  query('country').trim().notEmpty().withMessage('Country is required'),

  query('zipcode')
    .isLength({ min: 4, max: 4 })
    .withMessage('Zipcode must be exactly 4 characters long'),
];
