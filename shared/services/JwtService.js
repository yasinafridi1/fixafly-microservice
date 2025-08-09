import jwt from "jsonwebtoken";
import envVariables from "../config/Constants.js";
import User from "../models/UserModel.js";

const { accessTokenSecret, refreshTokenSecret } = envVariables;

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export const storeTokens = async (accessToken, refreshToken, userId) => {
  return await User.update(
    { accessToken: accessToken, refreshToken: refreshToken },
    { where: { userId } }
  );
};

export const verifyAccessToken = async (token) => {
  try {
    const decodedToken = jwt.verify(token, accessTokenSecret);
    return decodedToken;
  } catch (error) {
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
