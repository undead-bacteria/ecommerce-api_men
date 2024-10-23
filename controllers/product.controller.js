import asyncHandler from "express-async-handler";
import createError from "http-errors";
import productModel from "../models/product.model.js";
import {
  createProductService,
  getAllProductService,
  getProductBySlugService,
  deleteProductByIdService,
  bulkDeleteProductService,
  addProductToWishListService,
  bulkDeleteProductService,
} from "../services/product.service.js";
import checkMongoID from "../helper/checkMongoId.mjs";
import { successResponse } from "../helper/responseHandler.mjs";

/**
 *
 * @apiDescription    Get all product  Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/product
 * @apiAccess         Public
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 *
 * @apiSuccess        { Status, Message, Result :[Page, Totalproduct, Data:[] ] }
 * @apiFailed         { StatusCode, Message, Stack }
 * @apiError          ( Not Found 404 )   No product data found
 *
 */

export const getAllProduct = asyncHandler(async (req, res) => {
  // search query fields
  const searchFields = ["name", "title", "slug", "brand", "category", "tags"];

  // default page and limit value
  req.query.page = Number(req.query.page) || 1;
  req.query.limit = Number(req.query.limit) || 10;

  const { result, pagination } = await getAllProductService(req, searchFields);

  successResponse(res, {
    statusCode: 200,
    message: "Product data fetched successfully.",
    payload: {
      pagination,
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Create a New product  Data
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/product
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

export const createProduct = asyncHandler(async (req, res) => {
  // product images
  const images = req?.files?.map(
    (file) => file.fieldname === "product_images" && file.filename
  );
  // create new product
  const product = await createProductService(req, images);

  successResponse(res, {
    statusCode: 201,
    message: "Product data created successfully.",
    payload: {
      data: product,
    },
  });
});

/**
 *
 * @apiDescription    Get  a Single product  Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/product/:id
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
 * @apiError          ( Not Found 404 )      product Data not found
 *
 */

export const getProductBySlug = asyncHandler(async (req, res) => {
  // data validation
  const product = await getProductBySlugService(req.params.slug);

  successResponse(res, {
    statusCode: 200,
    message: "Product data fetched successfully.",
    payload: {
      data: product,
    },
  });
});

/**
 *
 * @apiDescription    Delete a Single product  Data
 * @apiMethod         DELETE
 *
 * @apiRoute          /api/v1/product/:id
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
 * @apiError          ( Not Found 404 )       product Data not found
 *
 */

export const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  checkMongoID(id);

  const result = await deleteProductByIdService(id);

  successResponse(res, {
    statusCode: 200,
    message: "Product data deleted successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Update a Single product  Data
 * @apiMethod         PUT / PATCH
 *
 * @apiRoute          /api/v1/product/:id
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
 * @apiError          ( Not Found 404 )      product Data not found
 *
 */

export const updateProductById = asyncHandler(async (req, res, next) => {
  // product images
  const images = req?.files?.map(
    (file) => file.fieldname === "product_images" && file.filename
  );

  // create new product
  const product = await productModel.findOne({ id: req.params.id });

  const options = {
    $set: {
      ...req.body,
      price: {
        regular: req.body?.price?.regular || product.price.regular,
        sale: req.body?.price?.sale || product.price.sale,
      },
      shipping: {
        type: req.body?.shipping?.type || product.shipping.type,
        fee: req.body?.shipping?.fee || product.shipping.fee,
      },
      description: {
        short: req.body?.description?.short || product.description.short,
        long: req.body?.description?.long || product.description.long,
      },
      images: images && images.length > 0 ? images : product.images || "",
    },
  };
  const result = await productModel.findOneAndUpdate(
    { id: req.params.id },
    options,
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  if (!result) throw createError(404, "Couldn't find any product data.");

  successResponse(res, {
    statusCode: 200,
    message: "Product data updated successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    Delete multiple product  Data by id
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
 * @apiError          ( Not Found 404 )       product Data not found
 *
 */

export const bulkDeleteProduct = asyncHandler(async (req, res) => {
  // id validation
  if (!req.body.ids) throw createError(400, "Please provide ids.");

  // has ids or not
  if (!req.body.ids.length) throw createError(400, "Please provide ids.");

  const result = await bulkDeleteProductService(req.body.ids);

  successResponse(res, {
    statusCode: 200,
    message: "Successfully deleted product data.",
    payload: {
      data: result,
    },
  });
});

// product add to wishlist
export const addProductToWishList = asyncHandler(async (req, res) => {
  await addProductToWishListService(req);

  successResponse(res, {
    statusCode: 200,
    message: "Product added to wishlist successfully.",
    payload: {
      data: req.me,
    },
  });
});

// product add to wishlist
export const removeProductFromWishList = asyncHandler(async (req, res) => {
  await removeProductFromWishList(req);

  successResponse(res, {
    statusCode: 200,
    message: "Product removed from wishlist successfully.",
    payload: {
      data: req.me,
    },
  });
});
