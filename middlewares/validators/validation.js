import { validationResult } from "express-validator";
import { errorResponse } from "../../helper/responseHandler.js";

const runValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, {
      statusCode: 422,
      message: errors.array()[0].msg,
    })
  }
  next()
}

export default runValidation;