import { USER_STATUS } from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import ControllerModel from "../models/ControllerModel.js";
import { controllerDTO } from "../helpers/dtos.js";

function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = '!@#$%^&*(),.?":{}|<>';

  const all = upper + lower + numbers + special;

  // Ensure at least one character from each category
  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters
  const remainingLength = Math.floor(Math.random() * 8) + 4; // total length 8-15
  for (let i = 0; i < remainingLength; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password to avoid predictable pattern
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}

export const loginController = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await ControllerModel.findOne({ email, isDeleted: false });
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 400));
  }

  if (user.status === USER_STATUS.blocked) {
    return next(
      new ErrorHandler("Your account has been blocked by admin", 400)
    );
  }

  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signin`, {
      email,
      password,
    });
    const { data } = response.data;
    const { accessToken, refreshToken, role } = data;
    const userData = controllerDTO(user, role);
    return SuccessMessage(res, "Logged in successfully", {
      userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});

export const addNewController = AsyncWrapper(async (req, res, next) => {
  const { email, role, fullName } = req.body;
  const password = generatePassword();
  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signup`, {
      email,
      password,
      role,
    });
    const { data } = response?.data;
    const newController = new ControllerModel({
      _id: data._id,
      fullName: fullName,
      email,
    });
    const result = await newController.save();
    return SuccessMessage(res, "Controller added successfully", result);
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});

export const softDeleteController = AsyncWrapper(async (req, res, next) => {
  const controller = await ControllerModel.findById(req.params.id);
  if (!controller) {
    return next(new ErrorHandler("Controller not found", 404));
  }

  await ControllerModel.softDeleteById(req.params.id);
  return SuccessMessage(res, "Controller deleted successfully");
});
