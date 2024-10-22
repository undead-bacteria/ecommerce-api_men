import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from "../controllers/category.controller.js";
import {
  categoryCreateValidator,
  categoryUpdateValidator,
} from "../middlewares/validators/file/category.validator.js";
import runValidation from "../middlewares/validators/validation.js";
import { categoryMulter } from "../middlewares/multer.js";
import { isLoggedIn } from "../middlewares/verify.js";
import { authorization } from "../middlewares/authorization.js";

// create router
const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(getAllCategories)
  .post(
    isLoggedIn,
    categoryMulter,
    categoryCreateValidator,
    runValidation,
    createCategory
  );

categoryRouter
  .route("/:id([0-9a-fA-F]{24})")
  .get(isLoggedIn, authorization("admin"), getCategoryById)
  .delete(isLoggedIn, authorization("admin"), deleteCategoryById)
  .patch(
    isLoggedIn,
    authorization("admin"),
    categoryMulter,
    categoryUpdateValidator,
    runValidation,
    updateCategoryById
  );

export default categoryRouter;
