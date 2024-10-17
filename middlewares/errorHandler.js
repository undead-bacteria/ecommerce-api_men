import { mongoose } from "mongoose";
import { errorResponse } from "../helper/responseHandler.js"

export const errorHandler = (err, req, res, next) => {
  // mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    // show first error message only to user
    if (err.errors) {
      err.message = Object.values(err.errors)[0].message;
    }
    err.status = 400
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    err.status = 400;
    err.message = `${Object.keys(err.keyValue)} must be unique`
  }

  // jwt token error
  if (err.name === "JsonWebTokenError") {
    err.status = 401;
    err.message = "Invalid token"
  }

  const errorMessage = err.message || "Unknown Error"
  const errorStatus = err.status || 500;

  errorResponse(res, {
    statusCode: errorStatus.Error, 
    message: errorMessage
  })
}