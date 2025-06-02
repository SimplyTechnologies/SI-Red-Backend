import { body } from 'express-validator';

export const vehicleValidationRules = [
  body('model_id').isInt().withMessage('model_id must be an integer'),

  body('year').isString().notEmpty().withMessage('Year is required'),

  body('vin')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters long')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('VIN contains invalid characters'),

  body('location').notEmpty().withMessage('Location is required'),

  body('street').trim().notEmpty().withMessage('Street is required'),

  body('city').trim().notEmpty().withMessage('City is required'),

  body('state').trim().notEmpty().withMessage('State is required'),

  body('country').trim().notEmpty().withMessage('Country is required'),

  body('zipcode')
    .isLength({ min: 4, max: 4 })
    .withMessage('Zipcode must be exactly 4 characters long'),
];
