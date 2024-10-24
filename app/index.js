import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import morgan from "morgan";

// import routes
import path from "path";
import corsOptions from "../config/corsSetup.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import { successResponse } from "../helper/responseHandler.js";
import version1 from "../app/version1.js";
import dataRouter from "../routes/data.route.js";

// express app
const app = express();

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// cookie parser
app.use(cookieParser());

// static folder
app.use("/public", express.static(path.resolve("public")));

// version 1 routes
version1.forEach((router) => {
  app.use(router.path, router.route);
});

// sample data routes
app.use("/api/v1/data", dataRouter);

/**
 * @description   : Home route
 * @access        : Public
 * @method        : GET
 */

app.get(
  "/",
  asyncHandler(async (_, res) => {
    successResponse(res, {
      statusCode: 200,
      message: "Api is running successfully.",
    });
  })
);

// client error handling
app.use(
  asyncHandler(async () => {
    throw createError.NotFound("Couldn't find this route.");
  })
);

// server error handling
app.use(errorHandler);

export default app;
