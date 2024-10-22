import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { isValidObjectId } from "mongoose";
import {
  createBrandService,
  getAllBrandService,
  updateBrandByIdService,
  getBrandByIdService,
  deleteBrandByIdService,
  bulkDeleteBrandService,
} from "../services/brand.service.js";
import checkMongoID from "../helper/checkMongoId.mjs";
import { successResponse } from "../helper/responseHandler.mjs";

/**
 *
 * @apiDescription    Get all brand  Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/brand
 * @apiAccess         Public
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 *
 * @apiSuccess        { Status, Message, Result :[Page, Totalbrand, Data:[] ] }
 * @apiFailed         { StatusCode, Message, Stack }
 * @apiError          ( Not Found 404 )   No brand data found
 *
 */

export const getAllBrand = asyncHandler(async (req, res) => {
  // search query fields
  const searchFields = ["name", "slug", "description", "_id"];

  // default page and limit value
  req.query.page = Number(req.query.page) || 1;
  req.query.limit = Number(req.query.limit) || 10;

  const { result, pagination } = await getAllBrandService(req, searchFields);

  successResponse(res, {
    statusCode: 200,
    message: "Brand data fetched successfully.",
    payload: {
      pagination,
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Create a New brand  Data
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/brand
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

export const createBrand = asyncHandler(async (req, res) => {
  // create new brand
  const brand = await createBrandService(req);

  successResponse(res, {
    statusCode: 201,
    message: "Brand data created successfully.",
    payload: {
      data: brand,
    },
  });
});

/**
 *
 * @apiDescription    Get  a Single brand  Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/brand/:id
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
 * @apiError          ( Not Found 404 )      brand Data not found
 *
 */

export const getBrandById = asyncHandler(async (req, res) => {
  // data validation
  const brand = await getBrandByIdService(req.params.id);

  successResponse(res, {
    statusCode: 200,
    message: "Brand data fetched successfully.",
    payload: {
      data: brand,
    },
  });
});

/**
 *
 * @apiDescription    Delete a Single brand  Data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/brand/:id
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
 * @apiError          ( Not Found 404 )       brand Data not found
 *
 */

export const deleteBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  checkMongoID(id);

  const result = await deleteBrandByIdService(id);

  successResponse(res, {
    statusCode: 200,
    message: "Brand data deleted successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update a Single brand  Data
 * @apiMethod         PUT / PATCH
 *
 * @apiRoute          /api/v1/brand/:id
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
 * @apiError          ( Not Found 404 )      brand Data not found
 *
 */

export const updateBrandById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  checkMongoID(id);

  const options = {
    $set: {
      name: req.body.name,
      description: req.body.description,
      image: req?.file.filename,
      slug: req.body.name && req.body.name.toLowerCase().split(" ").join("-"),
    },
  };
  const result = await updateBrandByIdService(req?.file?.filename, id, options);

  successResponse(res, {
    statusCode: 200,
    message: "Brand data updated successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Delete multiple brand  Data by id
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

export const bulkDeleteBrand = asyncHandler(async (req, res, next) => {
  // id validation
  if (!req.body.ids) throw createError(400, "Please provide ids.");

  // has ids or not
  if (!req.body.ids.length) throw createError(400, "Please provide ids.");

  req.body.ids.forEach((id) => {
    if (!isValidObjectId(id)) {
      throw createError(400, `${id} is not a valid id.`);
    }
  });

  const result = await bulkDeleteBrandService(req.body.ids);

  successResponse(res, {
    statusCode: 200,
    message: "Successfully deleted brand data.",
    payload: {
      result,
    },
  });
});
