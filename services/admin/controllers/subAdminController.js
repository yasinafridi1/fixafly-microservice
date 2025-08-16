import { USER_ROLES, USER_STATUS } from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
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

export const login = AsyncWrapper(async (req, res, next) => {
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
  const { email, role, fullName, status } = req.body;
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
      status,
    });
    const result = await newController.save();
    const userData = controllerDTO(result, USER_ROLES.controller);
    return SuccessMessage(res, "Controller added successfully", userData);
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

export const updateController = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params; // Controller ID
  const { fullName, email, status } = req.body;

  // Find the controller first
  const controller = await ControllerModel.findById({
    _id: id,
    isDeleted: false,
  });
  if (!controller) {
    return next(new ErrorHandler("Controller not found", 404));
  }

  // if (email !== controller.email) {
  //   const existingController = await ControllerModel.findOne({
  //     email: email,
  //     _id: { $ne: id },
  //   });
  //   if (existingController) {
  //     return next(new ErrorHandler("Email already exists", 400));
  //   }
  //   controller.email = email;
  // }

  // Update fields only if provided
  controller.fullName = fullName;
  controller.status = status;

  // Save the changes
  const result = await controller.save();
  const userData = controllerDTO(result, USER_ROLES.controller);
  return SuccessMessage(res, "Controller updated successfully", userData);
});

export const getAllControllers = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", status } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const pageLimit = parseInt(limit, 10) || 10;

  // Build filter query
  const filter = { isDeleted: false };
  // ✅ Status filter (BLOCKED / ACTIVE)
  if (status && ["BLOCKED", "ACTIVE"].includes(status)) {
    filter.status = status;
  }

  // ✅ Search filter (fullName OR email)
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Count total matching documents
  const totalRecords = await ControllerModel.countDocuments(filter);

  // ✅ Fetch paginated results
  const controllers = await ControllerModel.find(filter)
    .sort({ createdAt: -1 }) // latest first
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  const userData = controllers.map((item) =>
    controllerDTO(item, USER_ROLES.controller)
  );

  return SuccessMessage(res, "Controllers fetched successfully", {
    userData,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageLimit),
      page: pageNumber,
      limit: pageLimit,
    },
  });
});

export const getControllerById = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // ✅ Fetch controller by ID where not deleted
  const controller = await ControllerModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!controller) {
    return next(new ErrorHandler("Controller not found", 404));
  }

  // ✅ Transform data with DTO
  const userData = controllerDTO(controller, USER_ROLES.controller);

  return SuccessMessage(res, "Controller fetched successfully", userData);
});
