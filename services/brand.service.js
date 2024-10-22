import createError from "http-errors";
import brandModel from "../models/brand.model.js";
import filterQuery from "../utils/filterQuery.js";
import pagination from "../utils/pagination.js";
import deleteImage from "../helper/deleteImage.js";

// get all brand service
export const getAllBrandService = async (req, searchFields) => {
  // query filter
  const {
    queries: { skip, limit, fields, sortBy },
    filters,
  } = filterQuery(req, searchFields);

  const result = await brandModel
    .find(filters)
    .skip(skip)
    .limit(limit)
    .select(fields)
    .sort(sortBy)
    .lean()
    .then((brands) => {
      return brands.map((brand) => {
        return {
          ...brand,
          links: {
            self: `/api/v1/brands/${brand.slug}`,
          },
        };
      });
    });

  // if result is empty
  if (!result.length) throw createError(404, "Couldn't find any brand data.");

  // pagination object
  const paginationObject = await pagination({
    limit,
    page: req.query.page,
    skip,
    model: brandModel,
    filters,
  });

  return {
    result,
    pagination: paginationObject,
  };
};

// create brand service
export const createBrandService = async (req) => {
  const { file } = req;

  const { name, description, slug } = req.body;

  // name validation
  const beforeData = await brandModel.findOne({ name }).lean();

  if (beforeData) {
    deleteImage(`/public/images/brands/${file.filename}`);
    throw createError(400, "Brand name already exists.");
  }

  // create new brand
  const result = await brandModel.create({
    name,
    slug,
    description,
    image: req?.file?.filename,
  });

  return result;
};

// get brand by slug service
export const getBrandBySlugService = async (slug) => {
  // data validation
  const result = await brandModel.findOne({ slug });

  if (!result) throw createError(404, "Couldn't find any brand data");

  return result;
};

// delete brand service
export const deleteBrandByIdService = async (id) => {
  // find by id and delete
  const result = await brandModel.findByIdAndDelete(id);

  if (!result) throw createError(404, "Couldn't find any brand data");

  result.image && deleteImage(`/public/images/brands/${result?.image}`);

  return result;
};

// update brand by id service
export const updateBrandByIdService = async (file, id, options) => {
  // find by id and update
  const result = await brandModel.findByIdAndUpdate(id, options, {
    new: true,
    runValidators: true,
  });

  if (!result) throw createError(404, "Couldn't find any brand data");

  // previous image delete
  file && deleteImage(`/public/images/brands/${result?.image}`);

  return result;
};

// bulk delete brand service
export const bulkDeleteBrandService = async (ids) => {
  // check data is present or not
  await Promise.all(
    ids.map(async (id) => {
      const result = await brandModel.exists({ _id: id });
      if (!result)
        throw createError(404, `Couldn't find brand data with id = ${id}`);
    })
  );

  const result = await brandModel.deleteMany({ _id: { $in: ids } });

  // delete image
  result.forEach((brand) => {
    brand.image && deleteImage(`/public/images/brands/${brand?.image}`);
  });

  return result;
};
