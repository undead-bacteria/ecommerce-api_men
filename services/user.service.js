import bcrypt from "bcryptjs";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { passwordResetKey, passwordResetKeyExpire } from "../app/secret.js";
import createJWT from "../helper/createJWT.js";
import userModel from "../models/user.model.js";
