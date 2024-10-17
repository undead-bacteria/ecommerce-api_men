import { node_env } from "../app/secret.js"

// clear cookie
export const clearCookie = (res, cookieName) => {
  res.clearCookie(cookieName, {
    secure: node_env == "development" ? false : true,
    sameSite: "strict",
    httpOnly: true,
  })
}

// set cookie
export const setCookie = (res, cookieName, cookieValue, maxAge) => {
  res.cookie(cookieName, cookieValue, {
    secure: node_env == "development" ? false : true,
    sameSite: "none",
    httpOnly: true,
    maxAge,
  })
}