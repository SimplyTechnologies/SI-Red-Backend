import { body } from 'express-validator';

export const validateUpdateUser = [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('Enter the first name.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Enter a valid first name.')
    .bail()
    .matches(/^[A-Za-zÀ-ÿ\u00C0-\u017F' -]+$/)
    .withMessage('Enter a valid first name.'),

  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Enter the last name.')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Enter a valid last name.')
    .bail()
    .matches(/^[A-Za-zÀ-ÿ\u00C0-\u017F' -]+$/)
    .withMessage('Enter a valid last name.'),

  body('phoneNumber')
    .optional()
    .notEmpty()
    .withMessage('Enter the phone number')
    .bail()
    .matches(/^\+\d{8,15}$/)
    .withMessage('Phone number must start with "+" and contain 8 to 15 digits only.'),
];
