import express from "express";
import {
  createProduct,
  getAllProduct,
  getProductBySlug,
  updateProductById,
  deleteProductById,
  addProductToWishList,
  removeProductFromWishList,
} from "../controllers/product.controller.js";
import {
  productCreateValidator,
  productUpdateValidator,
} from "../middlewares/validators/file/product.validator.js";
import runValidation from "../middlewares/validators/validation.js";
import { productMulter } from "../middlewares/multer.js";
import { isLoggedIn } from "../middlewares/verify.js";
import { authorization } from "../middlewares/authorization.js";

// create router
const productRouter = express.Router();

productRouter
  .route("/")
  .get(getAllProduct)
  .post(
    isLoggedIn,
    authorization("admin", "seller"),
    productMulter,
    productCreateValidator,
    runValidation,
    createProduct
  );

productRouter.route(":/slug").get(getProductBySlug);

productRouter
  .route("/:id([0-9a-fA-F]{24})")
  .delete(isLoggedIn, authorization("admin", "seller"), deleteProductById)
  .patch(
    isLoggedIn,
    authorization("admin", "seller"),
    productMulter,
    productUpdateValidator,
    runValidation,
    updateProductById
  );

productRouter
  .route("/add-to-wishlist/:id([0-9a-fA-F]{24})")
  .patch(isLoggedIn, authorization("user"), addProductToWishList);

productRouter
  .route("/remove-from-wishlist/:id([0-9a-fA-F]{24})")
  .patch(isLoggedIn, authorization("user"), removeProductFromWishList);

export default productRouter;
