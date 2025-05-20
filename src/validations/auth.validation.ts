import { body } from 'express-validator';

export const signInValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('rememberMe must be a boolean'),
];
