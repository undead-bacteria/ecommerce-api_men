import asyncHandler from "express-async-handler";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { jwtRegisterSecretKey, refreshTokenSecret } from "../app/secret.js";
import { clearCookie } from "../helper/cookie.js";
import { successResponse } from "../helper/responseHandler.js";
import {
  userRegisterService,
  userLoginService,
  activeUserAccountService,
  refreshTokenService,
} from "../services/auth.service.js";

/**
 *
 * @apiDescription    User Register
 * @apiMethod         POST
 *
 * @apiRoute          /api/v1/auth/register
 * @apiAccess         Public
 *
 * @apiSuccess        { success : true , message, data : {} }
 * @apiFailed         { success : false, error : { status : code , message} }
 *
 */

export const userRegister = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const verifyToken = await userRegisterService(req.body);

  successResponse(res, {
    statusCode: 200,
    message: `A verificaion email sent to ${email}. To create account, please verify.`,
    payload: {
      verifyToken,
    },
  });
});

/**
 *
 * @apiDescription    Verify Register Email
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/auth/verify
 * @apiAccess         Public (register user)
 *
 * @apiSuccess        { success : true , message, date }
 * @apiFailed         { success : false, error : { status : code , message} }
 *
 * @apiError          ( Bad Request 400 )  Token not Found
 *
 */

export const activeUserAccount = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw createError(404, "Token is required,.");

  const decoded = jwt.verify(token, jwtRegisterSecretKey);
  if (!decoded) throw createError(401, "Invalid token!");

  const result = await activeUserAccountService(decoded);
  successResponse(res, {
    statusCode: 201,
    message: "User account created successfully.",
    payload: {
      data: result,
    },
  });
});

/**
 *
 * @apiDescription    User Login
 * @apiMethod         POST
 *
 * @apiBody           { email, password }
 *
 * @apiRoute          /api/v1/auth/login
 * @apiAccess         Public
 *
 * @apiSuccess        { success : true , message, data:{} }
 * @apiFailed         { success : false, error : { status : code , message} }
 *
 */

export const userLogin = asyncHandler(async (req, res) => {
  const loginUser = await userLoginService(res, req.body);

  successResponse(res, {
    statusCode: 200,
    message: "Successfully Login.",
    payload: {
      loginUser,
    },
  });
});

/**
 *
 * @apiDescription    User Logout
 * @apiMethod         POST
 *
 * @apiCookies        AccessToken, RefreshToken
 *
 * @apiRoute          /api/v1/auth/logout
 * @apiAccess         Login User
 *
 * @apiSuccess        { success : true , message, data:{} }
 * @apiFailed         { success : false, error : { status : code , message} }
 *
 */

export const logout = (_, res) => {
  // clear cookies
  clearCookie(res, "accessToken");
  clearCookie(res, "refreshToken");

  successResponse(res, {
    statusCode: 200,
    message: "User successfully logout.",
  });
};

/**
 * @apiDescription    Refresh Token
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/auth/refresh-token
 *
 * @apiSuccess        { success : true , message, data:{} }
 * @apiFailed         { success : false, error : { status : code , message} }
 *
 */

export const refrehToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refrehToken) throw createError(401, "refresh token not found");

  // verify token
  const { email } = jwt.verify(refrehToken, refreshTokenSecret);
  if (!email) throw createError(401, "Invalid token!");

  const accessToken = await refreshTokenService(res, email);

  successResponse(res, {
    statusCode: 200,
    message: "Token refreshed.",
    payload: {
      accessToken,
    },
  });
});

/**
 *
 * @apiDescription    Login User Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/auth/me
 * @apiAccess         Login User
 *
 * @apiSuccess        { success : true , message, data:{} }
 * @apiFailed         { success : false, error : { status : code , message} }
 *
 */

export const userData = asyncHandler(async (req, res) => {
  if (!req?.me) throw createError(404, "User not found.");

  successResponse(res, {
    statusCode: 200,
    message: "Login user data.",
    payload: {
      data: req.me,
    },
  });
});
