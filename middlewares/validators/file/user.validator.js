import { body } from "express-validator";
import createError from "http-errors";

export const userRegisterValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required. Please provide a name.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be at least 3-50 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Please provide a email.")
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("password")
    .notEmpty()
    .withMessage("Password is required. Please provide a password.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .withMessage(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required.Please provide a gender.")
    .isIn(["male", "female"])
    .withMessage("Gender must be either male or female."),
];

export const userLoginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Please provide a email.")
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("password")
    .notEmpty()
    .withMessage("Password is required. Please provide a password.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const userPasswordUpdateValidator = [
  body("oldPassword").notEmpty().withMessage("Old password is required."),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .withMessage(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw createError(400, "Password doesn't macth.");
      }
      return true;
    }),
];

export const userVerifyCodeValidator = [
  body("code")
    .notEmpty()
    .withMessage("Code is required. Please provide a code.")
    .isLength({ min: 4 })
    .withMessage("Code must be at least 4 characters long"),
];

export const userResendCodeValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required. Please provide a email.")
    .isLength({ min: 4 })
    .withMessage("Please provide a valid email."),
];

export const userResetPasswordValidator = [
  body("resetToken")
    .notEmpty()
    .withMessage("Reset token is required. Please provide a reset token"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .withMessage(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw createError(400, "Password doesn't macth.");
      }
      return true;
    }),
];
