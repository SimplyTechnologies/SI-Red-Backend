import { body } from 'express-validator';

export const signInValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .bail()
    .notEmpty()
    .withMessage('Email address is required.'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .bail()
    .notEmpty()
    .withMessage('Password is Required.'),

  body('rememberMe').optional().isBoolean().withMessage('rememberMe must be a boolean'),
];
