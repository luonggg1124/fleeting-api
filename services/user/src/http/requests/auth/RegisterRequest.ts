import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

export const sendVerificationCodeRequest = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];
export const registerRequest = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email."),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .bail()
    .isLength({max: 32})
    .withMessage("Password must be at most 32 characters long")
    .isString()
    .withMessage("Password must be a string."),
  body("given_name")
    .notEmpty()
    .withMessage("Given name is required.")
    .bail()
    .isString()
    .withMessage("Given name must be a string.")
    .bail(),
  body("family_name")
    .notEmpty()
    .withMessage("Family name is required")
    .bail()
    .isString()
    .withMessage("Family name must be a string."),
  body("verificationCode")
    .notEmpty()
    .withMessage("Verification code is required")
    .bail()
    .isString()
    .withMessage("Verification code must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];
