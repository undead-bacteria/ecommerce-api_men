import express from "express";
import {
  createTag,
  getAllTag,
  getTagBySlug,
  updateTagById,
  deleteTagById,
} from "../controllers/tag.controller.js";
import { tagCreateValidator } from "../middlewares/validators/file/tag.validator.js";
import runValidation from "../middlewares/validators/validation.js";
import { isLoggedIn } from "../middlewares/verify.js";
import { authorization } from "../middlewares/authorization.js";

// create router
const tagRouter = express.Router();

tagRouter
  .route("/")
  .get(getAllTag)
  .post(
    isLoggedIn,
    authorization("admin", "seller"),
    tagCreateValidator,
    runValidation,
    createTag
  );

tagRouter
  .route("/:slug")
  .get(isLoggedIn, authorization("admin", "seller"), getTagBySlug);

tagRouter
  .route("/:id([0-9a-fA-F]{24})")
  .delete(isLoggedIn, authorization("admin", "seller"), deleteTagById)
  .patch(isLoggedIn, authorization("admin", "seller"), updateTagById);

export default tagRouter;
