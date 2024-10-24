import express from "express";
import {
  sampleBrandData,
  sampleCategoryData,
  sampleProductData,
  sampleTagsData,
  sampleUsersData,
} from "../controllers/sampledata.controller.js";

const dataRouter = express.Router();

dataRouter.route("/users").get(sampleUsersData);
dataRouter.route("/tags").get(sampleTagsData);
dataRouter.route("/categories").get(sampleCategoryData);
dataRouter.route("/brands").get(sampleBrandData);
dataRouter.route("/products").get(sampleProductData);

export default dataRouter;
