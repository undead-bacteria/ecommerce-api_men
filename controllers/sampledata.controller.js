import asyncHandler from "express-async-handler";
import userModel from "../models/user.model.js";
import brandModel from "../models/brand.model.js";
import tagModel from "../models/tag.model.js";
import productModel from "../models/product.model.js";
import categoryModel from "../models/category.model.js";
import { successResponse } from "../helper/responseHandler.js";
import usersData from "../data/usersData.js";
import brandData from "../data/brandData.js";
import tagsData from "../data/tagsData.js";
import categoryData from "../data/categoryData.js";
import productData from "../data/productData.js";

export const sampleUsersData = asyncHandler(async (req, res) => {
  // delete all exisiting users
  await userModel.deleteMany({});

  // insert sample data
  const users = await userModel.create(usersData).then((data) => {
    return data.map((user) => {
      const {
        password,
        __v,
        createdAt,
        updatedAt,
        ...userWithoutSensitiveInfo
      } = user._doc;
      return userWithoutSensitiveInfo;
    });
  });

  successResponse(res, {
    statusCode: 200,
    message: "Sample data added successfully.",
    payload: {
      totalUsers: users.length,
      data: users,
    },
  });
});

export const sampleTagsData = asyncHandler(async (req, res) => {
  // delete all exisiting tags
  await tagModel.deleteMany({});

  // insert sample data
  const tags = await tagModel.create(tagsData);

  successResponse(res, {
    statusCode: 200,
    message: "Sample data added successfully.",
    payload: {
      totalTags: tags.length,
      data: tags,
    },
  });
});

export const sampleCategoryData = asyncHandler(async (req, res) => {
  // delete all exisiting category
  await categoryModel.deleteMany({});

  await Promise.all(
    categoryData.map(async (cat) => {
      const result = await categoryModel.create(cat);

      // inserting children data
      if (cat?.children?.length > 0) {
        await Promise.all(
          cat.children.map(async (child) => {
            await categoryModel.create({
              ...child,
              parent: result._id,
            });
          })
        );
      }
    })
  );

  // insert sample data
  const category = await categoryModel
    .find({})
    .populate({
      path: "parent",
      select: "name",
      populate: {
        path: "parent",
        select: "name",
      },
    })
    .lean();

  successResponse(res, {
    statusCode: 200,
    message: "Sample data added successfully.",
    payload: {
      totalCategory: category.length,
      data: category,
    },
  });
});

export const sampleBrandsData = asyncHandler(async (req, res) => {
  // delete all exisiting brands
  await brandModel.deleteMany({});

  // insert sample data
  const brands = await brandModel.create(brandData);

  successResponse(res, {
    statusCode: 200,
    message: "Sample data added successfully.",
    payload: {
      totalBrands: brands.length,
      data: brands,
    },
  });
});

export const sampleProductsData = asyncHandler(async (req, res) => {
  // delete all exisiting products
  await productModel.deleteMany({});

  // insert sample data
  const products = await brandModel.create(productData);

  successResponse(res, {
    statusCode: 200,
    message: "Sample data added successfully.",
    payload: {
      totalProducts: products.length,
      data: products,
    },
  });
});
