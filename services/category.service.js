import createError from "http-errors";
import categoryModel from "../models/tag.model.js";
import filterQuery from "../utils/filterQuery.js";
import pagination from "../utils/pagination.js";
import deleteImage from "../helper/deleteImage.js";

// get all category service
export const getAllCategoryService = async (req, searchFields) => {
  // query filter
  const {
    queries: { skip, limit, fields, sortBy },
    filters,
  } = filterQuery(req, searchFields);

  const categories = await categoryModel
    .find(filters)
    .skip(skip)
    .limit(limit)
    .select(fields)
    .sort(sortBy)
    .lean()
    .then((categories) => {
      return categories.map((category) => {
        return {
          ...category,
          links: {
            self: `/api/v1/categories/${category.slug}`,
          },
        };
      });
    });

  // if result is empty
  if (!result.length)
    throw createError(404, "Couldn't find any category data.");

  // pagination object
  const paginationObject = await pagination({
    limit,
    page: req.query.page,
    skip,
    model: categoryModel,
    filters,
  });

  return {
    result,
    pagination: paginationObject,
  };
};

// create category service
export const createCategoryService = async (req) => {
  const { body, file } = req;

  // name validation
  const beforeData = await categoryModel.findOne({ name: body.name });

  if (beforeData) {
    file && deleteImage(file.path);
    throw createError(400, "Category name already exists.");
  }

  // create new category
  const category = await categoryModel.create({
    ...body,
    image: req?.file?.filename,
    creator: req.me._id,
  });

  return category;
};

// get category by id service
export const getCategoryByIdService = async (id) => {
  // data validation
  const category = await categoryModel.findOne({ id });

  if (!category) throw createError(404, "Couldn't find any category data");

  return category;
};

// delete category service
export const deleteCategoryByIdService = async (id) => {
  // find by id and delete
  const result = await categoryModel.findByIdAndDelete(id);

  if (!result) throw createError(404, "Couldn't find any category data");

  result.image && deleteImage(`/public/images/categories/${result?.image}`);

  return result;
};

// update category by id service
export const updateCategoryByIdService = async (id, options) => {
  // find by id and update
  const result = await categoryModel
    .findByIdAndUpdate(id, options, {
      new: true,
      runValidators: true,
      context: "query",
    })
    .lean();

  if (!result) throw createError(404, "Couldn't find any category data");

  // delete image
  options.$set.image &&
    deleteImage(`/public/images/categories/${result?.image}`);

  return result;
};

// bulk delete categories service
export const bulkDeleteCategoryService = async (ids) => {
  // check data is present or not
  await Promise.all(
    ids.map(async (id) => {
      const result = await categoryModel.exists({ _id: id });
      if (!result)
        throw createError(404, `Couldn't find category data with id = ${id}`);
    })
  );

  const result = await categoryModel.deleteMany({ _id: { $in: req.body.ids } });

  // delete image
  result.forEach((category) => {
    category.image &&
      deleteImage(`/public/images/categories/${category?.image}`);
  });

  return result;
};
