import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { isValidObjectId } from "mongoose";
import {
  createCategoryService,
  getAllCategoryService,
  updateCategoryByIdService,
  getCategoryByIdService,
  deleteCategoryByIdService,
  bulkDeleteCategoryService,
} from "../services/category.service.js";
import checkMongoID from "../helper/checkMongoId.mjs";
import { successResponse } from "../helper/responseHandler.mjs";

/**
 *
 * @apiDescription    Get all category  Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/category
 * @apiAccess         Public
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 *
 * @apiSuccess        { Status, Message, Result :[Page, TotalCategory, Data:[] ] }
 * @apiFailed         { StatusCode, Message, Stack }
 * @apiError          ( Not Found 404 )   No category data found
 *
 */

export const getAllCategories = asyncHandler(async (req, res) => {
  // search query fields
  const searchFields = ["name", "slug", "description", "_id"];

  // default page and limit value
  req.query.page = Number(req.query.page) || 1;
  req.query.limit = Number(req.query.limit) || 10;

  const { result, pagination } = await getAllCategoryService(req, searchFields);

  successResponse(res, {
    statusCode: 200,
    message: "Category data fetched successfully.",
    payload: {
      pagination,
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Create a New Category  Data
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/category
 * @apiAccess         Admin
 *
 * @apiHeaders        { string } Authorization   User's access token
 *
 * @apiSuccess        { Status ,Message, Data= { } }
 * @apiFailed         { Status, Error }
 *
 * @apiError          ( unauthorized 401 )   Unauthorized Only authenticated users can access the data
 * @apiError          ( Forbidden 403)  Forbidden Only admins can access the data
 *
 */

export const createCategory = asyncHandler(async (req, res) => {
  // create new category
  const category = await createCategoryService(req);

  successResponse(res, {
    statusCode: 201,
    message: "Category data created successfully.",
    payload: {
      data: category,
    },
  });
});

/**
 *
 * @apiDescription    Get  a Single Category  Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/category/:id
 * @apiAccess         Owner/Admin
 *
 * @apiHeaders        { string } Authorization   User's/ Admin's access token
 *
 * @apiSuccess        { Status, Message, Data:{ } }
 * @apiFailed         { StatusCode, Message, Stack }
 *
 * @apiError          ( Bad Request 400 )    Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )   Unauthorized Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )      Forbidden Only admins and owner can access the data
 * @apiError          ( Not Found 404 )      Category Data not found
 *
 */

export const getCategoryById = asyncHandler(async (req, res) => {
  // data validation
  const category = await getCategoryByIdService(req.params.id);

  successResponse(res, {
    statusCode: 200,
    message: "Category data fetched successfully.",
    payload: {
      data: category,
    },
  });
});

/**
 *
 * @apiDescription    Delete a Single Category  Data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/category/:id
 * @apiAccess         Admin/ Owner
 *
 * @apiHeaders        { string } Authorization   User's access token
 *
 * @apiParams         { ObjectId }
 *
 * @apiSuccess        { Status ,Message, Data:{ } }
 * @apiFailed         { StatusCode, Message, Stack }
 *
 * @apiError          ( Bad Request 400 )     Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found 404 )       Category Data not found
 *
 */

export const deleteCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  checkMongoID(id);

  const result = await deleteCategoryByIdService(id);

  successResponse(res, {
    statusCode: 200,
    message: "Category data deleted successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update a Single Category  Data
 * @apiMethod         PUT / PATCH
 *
 * @apiRoute          /api/v1/category/:id
 * @apiAccess         Admin/ Owner
 *
 * @apiParams         { ObjectId }
 *
 * @apiHeaders        { string } Authorization   User's access token
 *
 * @apiSuccess        { Status ,Message, Data:{ } }
 * @apiFailed         { StatusCode, Message, Stack }
 *
 * @apiError          ( Bad Request 400 )    Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )   Unauthorized Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )      Forbidden Only admins can access the data
 * @apiError          ( Not Found 404 )      Category Data not found
 *
 */

export const updateCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  checkMongoID(id);

  const options = {
    $set: {
      name: req.body.name,
      description: req.body.description,
      parent: req.body.parent,
      image: req?.file.filename,
      slug: req.body.name && req.body.name.toLowerCase().split(" ").join("-"),
    },
  };
  const result = await updateCategoryByIdService(id, options);

  successResponse(res, {
    statusCode: 200,
    message: "Category data updated successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Delete multiple category  Data by id
 * @apiMethod         DELETE
 *
 * @apiBody           { ids : [id1,id2,id3]  }
 * @apiAccess         Admin
 *
 * @apiHeaders        { string } Authorization   User's access token
 *
 * @apiParams         { ObjectId }
 *
 * @apiSuccess        { Status ,Message, Data:[] }
 * @apiFailed         { Status, Error }
 *
 * @apiError          ( Bad Request 400 )    Invalid syntax / parameters
 * @apiError          ( unauthorized 401 )    Unauthorized Only authenticated users can access the data
 * @apiError          ( Forbidden 403 )       Forbidden Only admins can access the data
 * @apiError          ( Not Found 404 )       Brand Data not found
 *
 */

export const bulkDeleteCategory = asyncHandler(async (req, res, next) => {
  // id validation
  if (!req.body.ids) throw createError(400, "Please provide ids.");

  // has ids or not
  if (!req.body.ids.length) throw createError(400, "Please provide ids.");

  req.body.ids.forEach((id) => {
    if (!isValidObjectId(id)) {
      throw createError(400, `${id} is not a valid id.`);
    }
  });

  // check data is present ot not
  await Promise.all(
    req.body.ids.map(async (id) => {
      const result = await categoryModel.findById(id).lean();

      if (!result)
        throw createError(404, `Couldn't find category dara with id = ${id}`);
    })
  );

  const result = await bulkDeleteCategoryService(req.body.ids);

  successResponse(res, {
    statusCode: 200,
    message: "Successfully deleted category data.",
    payload: {
      result,
    },
  });
});
