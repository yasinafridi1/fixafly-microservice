import jwt from "jsonwebtoken";
import envVariables from "../config/constants.js";
import LoginModel from "../models/LoginModel.js";

const { accessTokenSecret, refreshTokenSecret, shortTokenSecret } =
  envVariables;

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "3d",
  });

  return { accessToken, refreshToken };
};

export const storeTokens = async (accessToken, refreshToken, userId) => {
  return await LoginModel.updateOne(
    { _id: userId },
    { accessToken: accessToken, refreshToken: refreshToken }
  );
};

export const generateShortToken = (payload, time = "5m") => {
  return jwt.sign(payload, shortTokenSecret, { expiresIn: time });
};

export const verifyShortToken = async (token) => {
  try {
    const userData = jwt.verify(token, shortTokenSecret);
    if (userData) {
      return userData;
    }
    throw new Error("Token verification failed");
  } catch (err) {
    err.statusCode = 401; // Set custom status code for token verification errors
    err.message = "Token expired";
    throw err;
  }
};
