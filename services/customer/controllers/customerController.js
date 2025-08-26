import envVariables, { USER_ROLES, USER_STATUS } from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import { customerDto } from "../helpers/dtos.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";
import CustomerModel from "../models/CustomerModel.js";

const { authServiceUrl } = envVariables;

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await CustomerModel.findOne({ email, isDeleted: false });
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
    const userData = customerDto(user, role);
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

export const newCustomer = AsyncWrapper(async (req, res, next) => {
  const { email, role, fullName, password, phone, vatNumber } = req.body;
  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signup`, {
      email,
      password,
      role,
    });
    const { data } = response?.data;
    const profileUrl = await uploadFileToS3(req.file);
    const newCustomer = new CustomerModel({
      _id: data._id,
      fullName: fullName,
      email,
      phone,
      role,
      vatNumber: role === USER_ROLES.company ? vatNumber : null,
      profilePicture: profileUrl,
    });
    const result = await newCustomer.save();
    const userData = customerDto(result, role);
    return SuccessMessage(
      res,
      `${
        role === USER_ROLES.company ? "Company" : "Customer"
      }  added successfully`,
      userData
    );
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});

export const softDeleteCustomer = AsyncWrapper(async (req, res, next) => {
  const user = await CustomerModel.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await CustomerModel.softDeleteById(req.params.id);
  return SuccessMessage(res, "User deleted successfully");
});

export const updateCustomer = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { fullName, phone, vatNumber } = req.body;

  const user = await CustomerModel.findOne({ _id: id, isDeleted: false });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  let imageUrl = user.profilePicture;
  if (req.file) {
    // Delete previous image from S3 if exists
    if (imageUrl) {
      await deleteFileFromS3(imageUrl);
    }
    // Upload new image
    imageUrl = await uploadFileToS3(req.file);
  }
  // Update fields only if provided
  user.fullName = fullName;
  user.phone = phone;
  if (user.role === USER_ROLES.company) {
    user.vatNumber = vatNumber;
  }
  user.profilePicture = imageUrl;

  // Save the changes
  const result = await user.save();
  const userData = customerDto(result, user.role);
  return SuccessMessage(
    res,
    `${
      user.role === USER_ROLES.company ? "Company" : "Customer"
    }  updated successfully`,
    userData
  );
});

export const getAllUser = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", status, role } = req.query;

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

  if (role) {
    filter.role = role;
  }

  // ✅ Count total matching documents
  const totalRecords = await CustomerModel.countDocuments(filter);

  // ✅ Fetch paginated results
  const users = await CustomerModel.find(filter)
    .sort({ createdAt: -1 }) // latest first
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  const userData = users.map((item) => customerDto(item, item.role));

  return SuccessMessage(
    res,
    `${
      role === USER_ROLES.company ? "Companies" : "Customers"
    }  fetched successfully`,
    {
      userData,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageLimit),
        page: pageNumber,
        limit: pageLimit,
      },
    }
  );
});

export const getUserById = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // ✅ Fetch controller by ID where not deleted
  const user = await CustomerModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // ✅ Transform data with DTO
  const userData = customerDto(user, user.role);

  return SuccessMessage(
    res,
    `${
      user.role === USER_ROLES.company ? "Company" : "Customer "
    } detail fetched successfully`,
    userData
  );
});

export const updateUserStatus = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // ✅ Find user by ID where not deleted
  const user = await CustomerModel.findOne({ _id: id, isDeleted: false });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // ✅ Update status
  user.status = status;
  await user.save();

  return SuccessMessage(
    res,
    `${
      user.role === USER_ROLES.company ? "Company" : "Customer"
    } status updated to ${status} successfully`
  );
});
