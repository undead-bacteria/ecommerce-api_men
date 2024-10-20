import { body } from "express-validator";

export const tagCreateValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required. sPlease provide a name.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be at least 3-50 characters long."),
  body("slug").optional(),
];
