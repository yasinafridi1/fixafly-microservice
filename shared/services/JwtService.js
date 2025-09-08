import jwt from "jsonwebtoken";
import envVariables from "../../config/Constants.js";

const { accessTokenSecret, refreshTokenSecret } = envVariables;

export const verifyAccessToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, accessTokenSecret);
    return decodedToken;
  } catch (error) {
    console.log("Error ====>", error);
    error.statusCode = 401; // Set custom status code for token verification errors
    error.message = "Token expired";
    throw error;
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, refreshTokenSecret);
    return decodedToken;
  } catch (error) {
    error.statusCode = 401; // Set custom status code for token verification errors
    error.message = "Token expired";
    throw error;
  }
};
