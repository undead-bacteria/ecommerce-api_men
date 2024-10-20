import fs from "fs/promises";
import asyncHandler from "express-async-handler";
import { errorLogger, logger } from "./logger";

const deleteImage = asyncHandler(async (imagePath) => {
  try {
    // default image can't be deleted
    if (imagePath.includes("/default/default_")) {
      errorLogger.error("Default image can't be deleted");
      return;
    }
    await fs.access(imagePath);
    await fs.unlink(imagePath);

    logger.info("Image was deleted");
  } catch (error) {
    errorLogger.error(error);
  }
});

export default deleteImage;
