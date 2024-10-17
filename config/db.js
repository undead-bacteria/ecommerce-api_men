import mongoose from "mongoose"
import { mongoURL } from "../app/secret.js"
import { logger, errorLogger } from "../helper/logger.js"


const mongoDBConnection = async (options = {}) => {
  try {
    const connect = await mongoose.connect(mongoURL, options)
    logger.info(`MongoDB connected successfully to ${connect.connection.name}`)

    mongoose.connection.on("error", (error) => {
      errorLogger.error(error)
    })
  } catch (error) {
    errorLogger.error(error)
  }
}

export default mongoDBConnection