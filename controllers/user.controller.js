import asyncHandler from "express-async-handler";
import fs from "fs";
fs.promises;
import checkMongoId from "../helper/checkMongoId.js";
import { successResponse } from "../helper/responseHandler.js";
import deleteImage from "../helper/deleteImage.js";
import {
  createUserService,
  getAllUserService,
  updateUserByIdService,
  findUserByIdService,
  deleteUserByIdService,
  banUserByIdService,
  unbanUserByIdService,
  forgotPasswordByEmailService,
  resetPasswordService,
  updateUserPasswordByIdService,
} from "../services/user.service.js";

/**
 *
 * @apiDescription    Get All Register User Data
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/users
 * @apiAccess          Private ( Authenticated Role )
 *
 * @apiParams         [ page = number ]     default page = 1
 * @apiParams         [ limit = number ]    min = 1, default = 10
 * @apiParams         [ search query ]
 *
 *
 * @apiSuccess        { success : true , message, pagination , data }
 * @apiFailed         { success : false, error : { status : code , message} }
 * @apiError          ( Not Found 404 )   No Brand data found
 *
 */

export const getAllUsers = asyncHandler(async (req, res) => {
  // search query fields
  const searchFields = ["name", "email", "phone"];

  // default page and limit value
  req.query.page = Number(req.query.page) || 1;
  req.query.limit = Number(req.query.limit) || 10;

  // find user data and add links
  const { users, pagination } = await getAllUserService(req, searchFields);

  return successResponse(res, {
    statusCode: 200,
    message: "User data fetched successfully",
    payload: {
      pagination,
      data: users,
    },
  });
});

/**
 *
 * @apiDescription    Find User By ID
 * @apiMethod         GET
 *
 * @apiRoute          /api/v1/users/:id
 * @apiAccess          Private ( Authenticated Role )
 *
 * @apiParams         [ ID ]
 *
 * @apiSuccess        { success : true , message, data }
 * @apiFailed         { success : false, error : { status : code , message} }
 * @apiError          ( Not Found 404 )   No Brand data found
 *
 */

export const findUserById = asyncHandler(async (req, res) => {
  // id validation
  checkMongoId(req.params.id);

  // find user
  const user = await findUserByIdService(req.params.id);

  successResponse(res, {
    statusCode: 200,
    message: "Single user data fetched successfully",
    payload: {
      data: user,
    },
  });
});

// create user   *** only admin can create user
export const createUser = asyncHandler(async (req, res) => {
  const user = await createUserService(req.body);

  successResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    payload: {
      data: user,
    },
  });
});

// update user
export const updatedUserById = asyncHandler(async (req, res) => {
  checkMongoId(req.params.id)[
    // data removed from updation
    ("role", "isAdmin", "isBanned", "_id", "createdAt", "updatedAt")
  ].forEach((field) => delete req.body[field]);

  // update options
  const options = {
    $set: {
      ...req.body,
      photo: req.file && req.file.path,
    },
  };

  // update user
  const updatedUser = await updateUserByIdService(req.params.id, options);

  // delete previous image
  if (req.file && updatedUser.photo) {
    deleteImage(updatedUser.photo);
  }

  successResponse(res, {
    statusCode: 200,
    message: "User data updated successfully",
    payload: {
      data: updatedUser,
    },
  });
});

// delete user
export const deleteUserById = asyncHandler(async (req, res) => {
  checkMongoId(req.params.id);

  const deletedUser = await deleteUserByIdService(req.params.id);

  const userImagePath = deletedUser?.photo;
  userImagePath && deleteImage(userImagePath);

  return successResponse(res, {
    statusCode: 200,
    message: "User deleted successfully",
    payload: {
      data: deletedUser,
    },
  });
});

// ban user by id
export const banUserById = asyncHandler(async (req, res) => {
  checkMongoId(req.params.id);

  const updatedUser = await banUserByIdService(req.params.id);

  return successResponse(res, {
    statusCode: 200,
    message: "User banned successfully",
    payload: {
      data: updatedUser,
    },
  });
});

// unban user by id
export const unbanUserById = asyncHandler(async (req, res) => {
  checkMongoId(req.params.id);

  const updatedUser = await unbanUserByIdService(req.params.id);

  return successResponse(res, {
    statusCode: 200,
    message: "User unbanned successfully",
    payload: {
      data: updatedUser,
    },
  });
});

// update password
export const updatePasswordById = asyncHandler(async (req, res) => {
  checkMongoId(req.params.id);

  const options = {
    oldPassword: req.body.oldPassword,
    $set: {
      password: req.body.newPassword,
    },
  };

  const updatedUser = await updateUserPasswordByIdService(
    req.params.id,
    options
  );

  return successResponse(res, {
    statusCode: 200,
    message: "Password updated successfully",
    payload: {
      data: updatedUser,
    },
  });
});

// forgot password
export const forgotPasswordByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const resetToken = await forgotPasswordByEmailService(email);

  return successResponse(res, {
    statusCode: 200,
    message: `A password reset email sent to ${email}. To reset password, please verify.`,
    payload: {
      resetToken,
    },
  });
});

// reset password
export const resetPasswordBy = asyncHandler(async (req, res) => {
  // reset token
  const { resetToken } = req.body;

  // update password
  const updatedUser = await resetPasswordService(resetToken, req.body);

  return successResponse(res, {
    statusCode: 200,
    message: "Password reset successfully",
    payload: {
      data: updatedUser,
    },
  });
});
