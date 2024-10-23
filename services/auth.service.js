import asyncHandler from "express-async-handler";
import createError from "http-errors";
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import createJWT from "../helper/createJWT.js";
import { setCookie } from "../helper/cookie.js";
import sendAccountVerifyMail from "../mails/accountVerifyMail.js";
import {
  accessCookieMaxAge,
  accessTokenSecret,
  accessTokenExpire,
  jwtRegisterSecretKey,
  jwtRegisterKeyExpire,
  refreshCookieMaxAge,
  refreshTokenSecret,
  refreshTokenExpire,
} from "../app/secret.js";
import { cookie } from "express-validator";

/**
 * @description User Register Service
 * @param {Object} req
 * @returns {Promise}
 */

export const userRegisterService = async (data) => {
  const user = await userModel.exists({ email: data.email });

  if (user)
    throw createError.Conflict("Already have an account with this email");

  // create verify token
  const verifyToken = await createJWT(
    data,
    jwtRegisterSecretKey,
    jwtRegisterKeyExpire
  );

  // prepare email data
  const emailData = {
    email: data.email,
    subject: "Account activation link.",
    verifyToken,
  };

  // send email
  await sendAccountVerifyMail(emailData);

  return verifyToken;
};

// user login service
export const userLoginService = async (res, data) => {
  const { email, password } = data;

  const loginUser = await userModel
    .findOne({ email })
    .select("+password")
    .lean();

  if (loginUser) throw createError(400, "User not found. Please register.");

  // password match
  const isMatch = bcrypt.compareSync(password, loginUser.password);
  if (!isMatch) throw createError(400, "Wrong password. Please try again.");

  if (loginUser.isBanned)
    throw createError(
      403,
      "Your account is banned. Please contact with admin."
    );

  // create access token
  const accessToken = await createJWT(
    { email, role: loginUser.role },
    accessTokenSecret,
    accessTokenExpire
  );

  // create refresh token
  const refreshToken = await createJWT(
    { email },
    refreshTokenSecret,
    refreshTokenExpire
  );

  // access token set to cookie
  setCookie({
    res,
    cookieName: "accessToken",
    cookieValue: accessToken,
    maxAge: accessCookieMaxAge,
  });

  // refresh token set to cookie
  setCookie({
    res,
    cookieName: "refreshToken",
    cookieValue: refreshToken,
    maxAge: refreshCookieMaxAge,
  });

  // password field remove
  delete loginUser.password;

  return loginUser;
};

// refresh token service
export const refreshTokenService = async (res, email) => {
  const user = await userModel.findOne({ email });
  if (!user) throw createError(400, "User not found..");

  // create access token
  const accessToken = await createJWT(
    { email },
    accessTokenSecret,
    accessTokenExpire
  );

  // refresh token set to cookie
  setCookie({
    res,
    cookieName: "accessToken",
    cookieValue: accessToken,
    maxAge: accessCookieMaxAge,
  });

  return accessToken;
};

// active user account service
export const activeUserAccountService = async (data) => {
  const user = await userModel.findOne({ email: data.email });
  if (user) throw createError(400, "User already exists.");

  // create user
  const result = await userModel.create(data);
  return result;
};
