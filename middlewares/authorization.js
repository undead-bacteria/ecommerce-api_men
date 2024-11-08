import { errorResponse } from "../helper/responseHandler.js"

export const authorization = (...role) => {
  return async (req, res, next) => {
    if (!role.includes(req?.me?.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You don't have permission to perform this action",
      })
    }

    // make sure the user is authorized to perform the action
    const id = req?.params?.id;

    if (id) {
      if (
        req?.me?.role === "admin" || req?.me?._id.toString() === id  // Assuming _id is a valid ObjectId
      ) {
        return next()
      }
      return errorResponse(res, {
        statusCode: 403,
        message: "You don't have permission to perform this action",
      })
    }
    
    // If there's no id check, proceed to the next middleware
    next()
  }
}