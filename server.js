import app from "./app/index.js"
import mongoDBConnection from "./config/db.js"
import { hostname, port } from "./app/secret.js"
import { errorLogger, logger } from "./helper/logger.js";

// app listen
app.listen(port, () => {
  mongoDBConnection();
  logger.info(
    `Server is running on http://localhost:${port} or http://${hostname}:${port}`
  )
})

// error handling for unhandledRejection
process.on("unhandledRejection", (error) => {
  errorLogger.error(error)
  process.exit(1)
})

// error handling for uncaughtException
process.on("uncaughtException", (error) => {
  errorLogger.error(error)
  process.exit(1)
})




