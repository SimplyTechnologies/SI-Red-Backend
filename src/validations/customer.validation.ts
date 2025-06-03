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
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Enter a valid phone number'),
];