import createError from "http-errors";
import { isValidObjectId } from "mongoose";
import productModel from "../models/product.model.js";
import categoryModel from "../models/category.model.js";
import brandModel from "../models/brand.model.js";
import tagModel from "../models/tag.model.js";
import filterQuery from "../utils/filterQuery.js";
import pagination from "../utils/pagination.js";
import deleteImage from "../helper/deleteImage.js";

// get all product service
export const getAllProductService = async (req, searchFields) => {
  // query filter
  const {
    queries: { skip, limit, fields, sortBy },
    filters,
  } = filterQuery(req, searchFields);

  const result = await productModel
    .find(filters)
    .skip(skip)
    .limit(limit)
    .select(fields)
    .sort(sortBy)
    .populate("brand category tags")
    .lean()
    .then((products) => {
      return products.map((product) => {
        return {
          ...product,
          links: {
            self: `/api/v1/products/${product.slug}`,
            "add-to-cart": `/api/v1/products/add-to-cart/${product.slug}`,
          },
        };
      });
    });

  // if result is empty
  if (!result.length) throw createError(404, "Couldn't find any product data.");

  // pagination object
  const paginationObject = await pagination({
    limit,
    page: req.query.page,
    skip,
    model: productModel,
    filters,
  });

  return {
    result,
    pagination: paginationObject,
  };
};

// create product service
export const createProductService = async (req, images) => {
  const { brand, category, tags } = req.body;

  // brand id and data check
  if (!isValidObjectId(brand)) throw createError(400, "Brand id is not valid.");
  const brandData = await brandModel.exists({ _id: brand });
  if (!brandData) throw createError(404, "Brand data not found");

  // category id and data check
  if (!isValidObjectId(category))
    throw createError(400, "Category id is not valid.");
  const categoryData = await categoryModel.exists({ _id: category });
  if (!categoryData) throw createError(404, "Category data not found");

  // tag id and data check
  for (let tag of tags) {
    if (!isValidObjectId(tag)) throw createError(400, "Tag id is not valid.");
    const tagData = await tagModel.exists({ _id: tag });
    if (!tagData) throw createError(404, "Tag data not found");
  }

  // create new product
  const result = await productModel.create({
    ...req.body,
    images,
    creator: req.me._id,
  });

  return result;
};

// get product by slug service
export const getProductBySlugService = async (slug) => {
  // data validation
  const result = await productModel.findOne({ slug }).lean();

  if (!result) throw createError(404, "Couldn't find any product data");

  return result;
};

// delete product service
export const deleteProductByIdService = async (id) => {
  // find by id and delete
  const result = await productModel.findByIdAndDelete(id);

  if (!result) throw createError(404, "Couldn't find any product data");

  result.images.forEach((filename) => {
    deleteImage(`/public/images/products/${filename}`);
  });

  return result;
};

// update product by id service

// bulk delete product service
export const bulkDeleteProductService = async (ids) => {
  // check data is present or not
  await Promise.all(
    ids.map(async (id) => {
      const result = await productModel.findById({ _id: id });
      if (!result)
        throw createError(404, `Couldn't find product data with id = ${id}`);
    })
  );

  const result = await productModel.deleteMany({ _id: { $in: ids } });

  // delete image
  result.forEach((product) => {
    product.images.forEach((filename) => {
      deleteImage(`/public/images/products/${filename}`);
    });
  });

  return result;
};

// product add to whishlist service
export const addProductToWishListService = async (req) => {
  // find product by id
  const product = await productModel.exists({ _id: req.params.id });

  if (!product) throw createError(404, "Couldn't find any product data.");

  // check product is already in wishlist or not
  if (req.me.wishList.includes(req.params.id)) {
    throw createError(400, "Product is already in your whishlist.");
  }

  // add product to wishlist
  req.me.wishList.push(req.params.id);
  await req.me.save();
};

// product add to whishlist service
export const removeProductFromWishListService = async (req) => {
  // find product by id
  const product = await productModel.exists({ _id: req.params.id });

  if (!product) throw createError(404, "Couldn't find any product data.");

  // check product is already in wishlist or not
  if (!req.me.wishList.includes(req.params.id)) {
    throw createError(400, "Product is not in your whishlist.");
  }

  // remove product to wishlist
  req.me.wishList = req.me.wishList.filter(
    (id) => id.toString() !== req.params.id
  );
  await req.me.save();
};
