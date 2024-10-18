import asyncHandler from "express-async-handler";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { accessTokenSecret } from "../app/secret.js";
import { clearCookie } from "../helper/cookie.js";
import { errorResponse } from "../helper/responseHandler.js";
import userModel from "../models/user.model.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req?.cookies?.accessToken;

  if (!token) {
    return next(
      createError(401, "Unauthorized, Access token not found. Please login.")
    );
  }

  jwt.verify(token, accessTokenSecret, async (err, decode) => {
    if (err) {
      clearCookie(res, "accessToken");
      return errorResponse(res, {
        statusCode: 400,
        message: "Unauthorized, Invalid access token. Please login again.",
      });
    }

    const loginUser = await userModel.findOne({ email: decode.email });

    if (!loginUser) {
      clearCookie(res, "accessToken");
      return errorResponse(res, {
        statusCode: 400,
        message: "Unauthorized, Please login.",
      });
    }

    req.me = loginUser;
    next();
  });
});

export const isLoggedOut = asyncHandler(async (req, res, next) => {
  const authToken = req?.cookies?.accessToken;

  if (authToken) {
    jwt.verify(token, accessTokenSecret, async (err, decode) => {
      if (err) {
        clearCookie(res, "accessToken");
        return errorResponse(res, {
          statusCode: 400,
          message: "Unauthorized, Invalid access token. Please login again.",
        });
      }

      const loginUser = await userModel.findOne({ email: decode.email });

      if (!loginUser) {
        clearCookie(res, "accessToken");
        return errorResponse(res, {
          statusCode: 400,
          message: "Unauthorized, User not found. Please login again.",
        });
      }

      return errorResponse(res, {
        statusCode: 400,
        message: "User is already logged in.",
      });
    });
  } else {
    next();
  }
});
