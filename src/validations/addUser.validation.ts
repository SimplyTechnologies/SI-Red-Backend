import { body } from 'express-validator';

export const validateCreateUser = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required')
    .notEmpty()
    .withMessage('Vehicle location is required.'),

  body('firstName')
    .isString()
    .notEmpty()
    .withMessage('First name is required.'),

  body('lastName')
    .isString()
    .notEmpty()
    .withMessage('Last name is required.'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone Number is required')
    .bail()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Enter a valid phone number'),
];
