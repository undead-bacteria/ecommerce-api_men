import express from "express";
import {
  brandData,
  categoryData,
  productData,
  tagsData,
  userData,
} from "../controllers/data.controller.js";

const dataRouter = express.Router();

dataRouter.route("/users").get(userData);
dataRouter.route("/tags").get(tagsData);
dataRouter.route("/categories").get(categoryData);
dataRouter.route("/brands").get(brandData);
dataRouter.route("/products").get(productData);

export default dataRouter;
