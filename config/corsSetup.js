import createError from "http-errors";
import { clientWhiteList } from "../app/secret.js"

// whitelist is an array of url's that are allowed to access the api
var whitelist = clientWhiteList;

// corsOptions is an object with a function that checks if the origin is in the whitelist
var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(createError(401, "Not allowed by CORS"))
    }
  }, 
  optionsSuccessStatus: 200,
  credentials: true,
}

export default corsOptions;