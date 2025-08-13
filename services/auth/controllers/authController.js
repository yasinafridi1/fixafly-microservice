import bcrypt from "bcrypt";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { generateTokens, storeTokens } from "../services/JwtService.js";
import { userDto } from "../services/DTO.js";
import SuccessMessage from "../utils/SuccessMessage.js";
import { USER_ROLES } from "../config/constants.js";
import LoginModel from "../models/LoginModel.js";

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await LoginModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 400));
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const unlockTime = user.lockUntil.toLocaleString();
    return next(
      new ErrorHandler(`Account is locked. Try again after: ${unlockTime}`, 400)
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    user.passwordTries += 1;
    if (user.passwordTries >= 5) {
      const lockTime =
        user.role === USER_ROLES.admin
          ? 15 * 60 * 60 * 1000
          : 3 * 60 * 60 * 1000;
      user.lockUntil = new Date(Date.now() + lockTime);
    }
    await user.save();
    return next(new ErrorHandler("Incorrect email or password", 400));
  }

  user.passwordTries = 0;
  user.lockUntil = null;
  await user.save();
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
