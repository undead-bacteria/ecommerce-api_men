import express from "express";
import {
  userRegister,
  userLogin,
  activateUserAccount,
  logout,
  userData,
  refreshToken,
} from "../controllers/auth.controller.js";
import rateLimiter from "../middlewares/rateLimiter.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../middlewares/validators/file/user.validator.js";
import runValidation from "../middlewares/validators/validation.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/verify.js";

// create router
const authRouter = express.Router();

authRouter
  .route("/register")
  .post(
    rateLimiter(5),
    isLoggedOut,
    userRegisterValidator,
    runValidation,
    userRegister
  );

authRouter.route("/activate").post(activateUserAccount);

authRouter
  .route("/login")
  .post(
    rateLimiter(5),
    isLoggedOut,
    userLoginValidator,
    runValidation,
    userLogin
  );

authRouter.route("/refresh-token").get(refreshToken);

authRouter.route("/logout").post(isLoggedIn, logout);

authRouter.route("/me").get(isLoggedIn, userData);

export default authRouter;
