import { errorLogger } from "./logger.js"

export const errorResponse = (
  res, 
  { statusCode = 500, message = "Unknown Server Error" }
) => {
  errorLogger.error(message)

  return res.status(statusCode).json({
    success: false,
    error: {
      status: statusCode,
      message
    }
  })
}

export const successResponse = (
  res, 
  { statusCode = 200, message = "Success", payload }
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...payload
  })
}