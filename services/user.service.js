import bcrypt from "bcryptjs";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { passwordResetKey, passwordResetKeyExpire } from "../app/secret.js";
import createJWT from "../helper/createJWT.js";
import userModel from "../models/user.model.js";
import filterQuery from "../utils/filterQuery.js";
import pagination from "../utils/pagination.js";
import sendPasswordResetMail from "../mails/passwordResetMail.js";

/**
 * @description get all users service
 */

export const getAllUserService = async (req, searchFields) => {
  // query filter
  const {
    queries: { skip, limit, fields, sortBy },
    filters,
  } = filterQuery(req, searchFields);

  //find users data and add links
  const users = await userModel
    .find(filters)
    .skip(skip)
    .limit(limit)
    .selcet(fields)
    .select("-password -__v")
    .sortBy(sortBy)
    .then((users) => {
      return users.map((user) => {
        delete user._doc.password;
        delete user._doc.__v;
        return {
          ...user._doc,
          links: {
            self: `/api/v1/users/${user._id}`,
          },
        };
      });
    });

  // if no user found
  if (!users.length) {
    throw createError(404, "No user data found.");
  }

  // pagination object
  const paginationObject = await pagination({
    limit,
    page: req.query.page,
    skip,
    model: userModel,
    filters,
  });

  return {
    users,
    pagination: paginationObject,
  };
};

/**
 * @description create user service
 */

export const createUserService = async (data) => {
  // create user
  const user = await userModel.create(data);
  return user;
};

/**
 * @description user find by id service
 */
export const findyUserByIdService = async (id) => {
  // find user
  const user = await userModel.findById(id).select("-password -__v -role");

  // if user not found
  if (!user) throw createError(404, "Couldn't find any user data.");

  return user;
};

/**
 * @description delete user by id service
 */

export const deleteUserByIdService = async (id) => {
  // find user
  const user = await userModel.findById(id);

  // if user is admin
  if (user?.role === "admin") {
    throw createError(400, "You can't delete admin users");
  }

  // delete user
  const deletedUser = await userModel.findByIdAndDelete(id);

  if (!deletedUser) {
    throw createError(404, "Couldn't find any user data");
  }

  return deletedUser;
};

/**
 * @description ban user by id service
 */

export const banUserByIdService = async (id) => {
  // find user
  const user = await userModel.findById(id);

  // if user is not found
  if (!user) {
    throw createError(404, "Couldn't find any user data.");
  }

  // if admin user
  if (user.role === "admin") {
    throw createError(400, "You can't ban admin user.");
  }

  // check if user already banned
  if (user.isBanned) {
    throw createError(400, "User is already banned");
  }

  // update user
  const updatedUser = await userModel.findOneAndUpdate(
    {
      _id: id,
      role: {
        $ne: "admin",
      },
    },
    { isBanned: true },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  return updatedUser;
};

/**
 * @description unban user by id service
 */

export const unbanUserByIdService = async (id) => {
  // find user
  const user = await userModel.findById(id);

  // if user is not found
  if (!user) {
    throw createError(404, "Couldn't find any user data.");
  }

  // check if user already banned
  if (!user.isBanned) {
    throw createError(400, "User is already unbanned");
  }

  // update user
  const updatedUser = await userModel.findOneAndUpdate(
    id,
    { isBanned: false },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  return updatedUser;
};

/**
 * @description update user by id service
 */

export const updateUserByIdService = async (id, options) => {
  // update user
  const updatedUser = await userModel.findByIdAndUpdate(id, options, {
    new: true,
    runValidators: true,
    context: query,
  });

  // if user not found
  if (!updatedUser) {
    throw createError(404, "Couldn't find any user data");
  }

  return updatedUser;
};

export const updateUserPasswordByIdService = async (id, options) => {
  const user = await userModel.findById(id).select("+password");

  if (!user) {
    throw createError(404, "Couldn't find any user data");
  }

  // password match
  const isMatch = bcrypt.compareSync(options.oldPassword, user.Password);

  // if not match
  if (!isMatch) {
    throw createError(400, "Old password is wrong");
  }

  const updatedUser = await userModel.findByIdAndUpdate(id, options, {
    new: true,
    runValidators: true,
    context: "query",
  });

  return updatedUser;
};

/**
 * @description forgot password by email service
 */

export const forgotPasswordByEmailService = async (email) => {
  const user = await userModel.findOne({ email });

  if (!user) throw createError(404, "Couldn't find any user");

  // create reset token
  const resetToken = await createJWT(
    { email },
    passwordResetKey,
    passwordResetKeyExpire
  );

  // prepare email data
  const emailData = { email, subject: "Password Reset Link", resetToken };

  // send email
  await sendPasswordResetMail(emailData);

  return resetToken;
};

/**
 * @description reset password service
 */

export const resetPasswordService = async (resetToken, data) => {
  // check reset token
  const { email } = jwt.verify(resetToken, passwordResetKey);

  if (!email) {
    throw createError(400, "Inavlid or expired token");
  }

  // check user
  const user = await userModel.findOne({ email });

  if (!user) {
    throw createError.NotFound("Couldn't find user with this email");
  }

  // update password
  user.password = data.newPassword;
  await user.save();

  // password delete from data
  delete user._doc.password;

  return user;
};
