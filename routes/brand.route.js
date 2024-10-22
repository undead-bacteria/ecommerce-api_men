import express from "express";
import {
  createBrand,
  getAllBrand,
  getBrandById,
  updateBrandById,
  deleteBrandById,
} from "../controllers/brand.controller.js";
import { brandCreateValidator } from "../middlewares/validators/file/brand.validator.js";
import runValidation from "../middlewares/validators/validation.js";
import { brandMulter } from "../middlewares/multer.js";
import { isLoggedIn } from "../middlewares/verify.js";
import { authorization } from "../middlewares/authorization.js";

// create router
const brandRouter = express.Router();

brandRouter
  .route("/")
  .get(getAllBrand)
  .post(
    isLoggedIn,
    authorization("admin", "seller"),
    brandMulter,
    brandCreateValidator,
    runValidation,
    createBrand
  );

brandRouter
  .route("/:id([0-9a-fA-F]{24})")
  .get(isLoggedIn, authorization("admin", "seller"), getBrandById)
  .delete(isLoggedIn, authorization("admin", "seller"), deleteBrandById)
  .patch(
    isLoggedIn,
    authorization("admin", "seller"),
    brandMulter,
    updateBrandById
  );

export default brandRouter;
