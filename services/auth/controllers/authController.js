import LoginModel from "../models/loginModel.js";
import bcrypt from "bcrypt";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { generateTokens, storeTokens } from "../services/JwtService.js";
import { userDto } from "../services/DTO.js";
import SuccessMessage from "../utils/SuccessMessage.js";

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await LoginModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 422));
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect email or password", 422));
  }

  const { accessToken, refreshToken } = generateTokens({
    _id: user._id,
    role: user.role,
  });

  await storeTokens(accessToken, refreshToken, user._id);
  const userData = userDto(user, accessToken, refreshToken);
  return SuccessMessage(res, "Logged in successfully", userData);
});

export const register = AsyncWrapper(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await LoginModel.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered", 409));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user document
  const newUser = new LoginModel({
    email,
    password: hashedPassword,
    role,
  });

  const result = await newUser.save();

  return SuccessMessage(res, "User registered successfully", {
    _id: result._id,
  });
});
