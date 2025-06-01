import { body } from 'express-validator';

export const customerValidationRules = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Enter a valid email address'),

  body('firstName')
    .notEmpty()
    .withMessage('First Name is required')
    .bail()
    .isString()
    .withMessage('First Name must be a string'),

  body('lastName')
    .notEmpty()
    .withMessage('Last Name is required')
    .bail()
    .isString()
    .withMessage('Last Name must be a string'),

  body('phone')
    .notEmpty()
    .withMessage('Phone Number is required')
    .bail()
    .matches(/^(\+374|374|0)?(77|91|93|94|95|96|97|98|99|33)\d{6}$/)
    .withMessage('Enter a valid Armenian phone number'),
];