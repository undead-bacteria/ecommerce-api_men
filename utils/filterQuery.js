const filterQuery = (req, searchFields) => {
  let filters = { ...req.query };

  // sort, page, limit exclude from filters
  const excludeFilters = ["sort", "page", "limit", "fields", "search"];
  excludeFilters.forEach((field) => delete filters[field]);

  let filterString = JSON.stringify(filters);

  filterString = filterString.replace(
    /\b(gt|gte|lt|lte|eq|neq)\b/g,
    (match) => `$${match}`
  );

  filters = JSON.parse(filterString);

  // full text search with regular expression
  if (req.query.search && searchFields.length) {
    const search = req.query.search;

    // _id remove from search fields with sortcut
    const index = searchFields.indexOf("_id");
    if (index > -1) {
      searchFields.splice(index, 1);
    }

    const regularExpression = { $regex: search, $options: "i" };

    filters = {
      ...filters,
      $or: [...searchFields.map((field) => ({ [field]: regularExpression }))],
    };
  }
};
