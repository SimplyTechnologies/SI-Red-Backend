import { body } from 'express-validator';

export const validateUpdateUser = [
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .notEmpty()
    .withMessage('First name cannot be empty'),

  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .notEmpty()
    .withMessage('Last name cannot be empty'),

  body('phoneNumber')
    .optional()
    .notEmpty()
    .withMessage('Phone Number cannot be empty')
    .bail()
    .matches(/^\+?[1-9]\d{7,14}$/)
    .withMessage('Enter a valid Phone Number'),
];