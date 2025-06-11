import { body } from 'express-validator';

export const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must include an uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must include a lowercase letter.')
    .matches(/\d/)
    .withMessage('Password must include a number.')
    .matches(/[@$!%*?&]/)
    .withMessage('Password must include a special character (e.g., @$!%*?&).'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm Password is required.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];
