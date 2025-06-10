import { body } from 'express-validator';

export const validateCreateUser = [
  body('email')
    .notEmpty()
    .withMessage('Enter the email address.')
    .bail()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .bail()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Enter a valid email address.'),

  body('firstName')
    .notEmpty()
    .withMessage('Enter the first name.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Enter a valid First name.')
    .bail()
    .matches(/^[A-Za-zÀ-ÿ\u00C0-\u017F' -]+$/)
    .withMessage('Enter a valid First name.'),

  body('lastName')
    .notEmpty()
    .withMessage('Enter the last name.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Enter a valid Last name.')
    .bail()
    .matches(/^[A-Za-zÀ-ÿ\u00C0-\u017F' -]+$/)
    .withMessage('Enter a valid Last name.'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone Number is required')
    .bail()
    .matches(/^\+\d{8,15}$/)
    .withMessage('Phone number must start with "+" and contain 8 to 15 digits only.'),
];
