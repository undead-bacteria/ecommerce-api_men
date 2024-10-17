import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import asyncHandler from "express-async-handler"
import createError from "http-errors"
import morgan from "morgan"


// express app
const app = express()

// middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"))

// cookie parser
app.use(cookieParser())

/**
 * @description   : Home route
 * @access        : Public
 * @method        : GET
 */

app.get(
  "/", 
  asyncHandler(async (_, res) => {
    successResponse(res, {
      statusCode: 200,
      message: "Api is running successfully."
    })
  })
)

// client error handling
app.use(
  asyncHandler(async () => {
    throw createError.NotFound("Could not find this route.")
  })
)


// server error handling 
app.use(errorHandler)

export default app;