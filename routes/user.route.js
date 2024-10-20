import express from "express";
import { authorization } from "../middlewares/authorization.js";
import runValidation from "../middlewares/validators/validation.js";
import { userMulter } from "../middlewares/multer.js";
import {
  userPasswordUpdateValidator,
  userRegisterValidator,
  userResetPasswordValidator,
} from "../middlewares/validators/file/user.validator.js";
import { isLoggedIn } from "../middlewares/validators/validation.js";
import {
  createUser,
  getAllUsers,
  updateUserById,
  findUserById,
  deleteUserById,
  banUserById,
  unbanUserById,
  forgotPasswordByEmail,
  resetPassword,
  updatePasswordById,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

const moduleRoutes = [
  {
    path: "/",
    method: "get",
    middleware: [isLoggedIn, authorization("admin")],
    route: getAllUsers,
  },
  {
    path: "/",
    method: "post",
    middleware: [
      isLoggedIn,
      authorization("admin"),
      userRegisterValidator,
      runValidation,
    ],
    route: createUser,
  },
  {
    path: "/ban-user/:id([0-9a-fA-F]{24})",
    method: "patch",
    middleware: [isLoggedIn, authorization("admin")],
    route: banUserById,
  },
  {
    path: "/unban-user/:id([0-9a-fA-F]{24})",
    method: "patch",
    middleware: [isLoggedIn, authorization("admin")],
    route: unbanUserById,
  },
  {
    path: "/update-password/:id([0-9a-fA-F]{24})",
    method: "patch",
    middleware: [
      isLoggedIn,
      authorization("admin", "user", "seller"),
      userPasswordUpdateValidator,
      runValidation,
    ],
    route: updatePasswordById,
  },
  {
    path: "/forgot-password/:email",
    method: "get",
    middleware: [isLoggedIn, authorization("admin", "user", "seller")],
    route: forgotPasswordByEmail,
  },
  {
    path: "/reset-password",
    method: "patch",
    middleware: [
      isLoggedIn,
      authorization("admin", "user", "seller"),
      userResetPasswordValidator,
      runValidation,
    ],
    route: resetPassword,
  },
  {
    path: "/:id([0-9a-fA-F]{24})",
    method: "get",
    middleware: [isLoggedIn, authorization("admin", "user", "seller")],
    route: findUserById,
  },
  {
    path: "/:id([0-9a-fA-F]{24})",
    method: "delete",
    middleware: [isLoggedIn, authorization("admin", "user", "seller")],
    route: deleteUserById,
  },
  {
    path: "/:id([0-9a-fA-F]{24})",
    method: "patch",
    middleware: [
      isLoggedIn,
      authorization("admin", "user", "seller"),
      userMulter,
    ],
    route: updateUserById,
  },
];

moduleRoutes.forEach((route) => {
  userRouter[route.method](route.path, route.middleware, route.route);
});

export default userRouter;
