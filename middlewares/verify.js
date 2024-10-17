import asyncHandler from "express-async-handler";
import createError from "http-errors"
import jwt from "jsonwebtoken"
import { accessTokenSecret } from "../app/secret.js"
import { clearCookie } from "../helper/cookie.js"
import { errorResponse } from "../helper/responseHandler.js"
import userModel from "../models/user.model.js"

// helper function to verify JWT
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, accessTokenSecret, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded)
    })
  })
}