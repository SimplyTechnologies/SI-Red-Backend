import { body } from 'express-validator';
import { Vehicle } from '../models';

export const vehicleValidationRules = [
  body('make_id')
    .notEmpty()
    .withMessage('Make is required')
    .isInt()
    .withMessage('make_id must be an integer'),

  body('model_id')
    .notEmpty()
    .withMessage('Model is required')
    .isInt()
    .withMessage('model_id must be an integer'),

  body('year').isString().notEmpty().withMessage('Year is required'),

  body('vin')
    .notEmpty()
    .withMessage('Vehicle VIN is required.')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters long')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('VIN contains invalid characters')
    .custom(async (value, {req}) => {
      const vehicleId = req?.params?.id;
      const existing = await Vehicle.findOne({ where: { vin: value } });
      if (existing && existing.id !== vehicleId) {
        throw new Error('VIN already exists.');
      }
    }),,

  body('street').trim().notEmpty().withMessage('Street is required'),

  body('city').trim().notEmpty().withMessage('City is required'),

  body('state').trim().notEmpty().withMessage('State is required'),

  body('country').trim().notEmpty().withMessage('Country is required'),

  body('year').trim().notEmpty().withMessage('Vehicle Year is required.'),

  body('zipcode')
    .trim()
    .notEmpty()
    .withMessage('Zip Code is required.')
    .isPostalCode('any')
    .withMessage('Invalid postal code'),
];

import { ValidationChain } from 'express-validator';

export function cleanValidators(arr: (ValidationChain | undefined)[]): ValidationChain[] {
  return arr.filter((v): v is ValidationChain => v !== undefined);
}