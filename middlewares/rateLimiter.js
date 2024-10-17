import { rateLimit } from "express-rate-limit"
import { errorResponse } from "../helper/responseHandler.js"

const rateLimiter = (limitValue) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: limitValue || 100, // Limit each IP to 100 requests per window (15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: (_, res) => {
      return errorResponse(res, {
        statusCode: 429,
        message: "Too many requests, please try again later."
      })
    }
  })
}

export default rateLimiter