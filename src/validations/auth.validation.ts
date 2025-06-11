import { body } from 'express-validator';

export const signInValidationRules = [
  body('email')
    .notEmpty()
    .withMessage('Email address is required.')
    .bail()
    .isEmail()
    .withMessage('Enter a valid email address.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('rememberMe').optional().isBoolean().withMessage('rememberMe must be a boolean'),
];
