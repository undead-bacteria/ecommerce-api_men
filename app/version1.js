import userRouter from "../routes/user.route.js";
import brandRouter from "../routes/brand.route.js";
import categoryRouter from "../routes/category.route.js";
import tagRouter from "../routes/tag.route.js";

// version 1 routes
const version1 = [
  {
    path: "/api/v1/users",
    route: userRouter,
  },
  {
    path: "/api/v1/brands",
    route: brandRouter,
  },
  {
    path: "/api/v1/tags",
    route: tagRouter,
  },
  {
    path: "/api/v1/categories",
    route: categoryRouter,
  },
];

export default version1;
