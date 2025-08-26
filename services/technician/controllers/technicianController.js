import { USER_ROLES, USER_STATUS } from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import TechnicianModel from "../models/TechnicianModel.js";
import { technicianDTO } from "../helpers/dtos.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await TechnicianModel.findOne({ email, isDeleted: false });
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

export const newTechnician = AsyncWrapper(async (req, res, next) => {
  const { email, role, fullName, status, password, lat, lng, phone } = req.body;
  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signup`, {
      email,
      password,
      role,
    });
    const { data } = response?.data;
    const profileUrl = await uploadFileToS3(req.file);
    const newTechnician = new TechnicianModel({
      _id: data._id,
      fullName: fullName,
      email,
      status,
      lat,
      lng,
      phone,
      profilePicture: profileUrl,
    });
    const result = await newTechnician.save();
    const userData = technicianDTO(result, USER_ROLES.controller);
    return SuccessMessage(res, "Technician added successfully", userData);
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});

export const softDeleteTechnician = AsyncWrapper(async (req, res, next) => {
  const technician = await TechnicianModel.findById(req.params.id);
  if (!technician) {
    return next(new ErrorHandler("Technician not found", 404));
  }

  await TechnicianModel.softDeleteById(req.params.id);
  return SuccessMessage(res, "Technician deleted successfully");
});

export const updateTechnician = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { fullName, lat, lng, phone } = req.body;

  const technician = await TechnicianModel.findById({
    _id: id,
    isDeleted: false,
  });
  if (!technician) {
    return next(new ErrorHandler("Technician not found", 404));
  }

  let imageUrl = technician.profilePicture;
  if (req.file) {
    // Delete previous image from S3 if exists
    if (imageUrl) {
      await deleteFileFromS3(imageUrl);
    }
    // Upload new image
    imageUrl = await uploadFileToS3(req.file);
  }
  // Update fields only if provided
  technician.fullName = fullName;
  technician.lat = lat;
  technician.lng = lng;
  technician.phone = phone;
  technician.profilePicture = imageUrl;

  // Save the changes
  const result = await technician.save();
  const userData = technicianDTO(result, USER_ROLES.technician);
  return SuccessMessage(res, "Technician updated successfully", userData);
});

export const getAllTechnician = AsyncWrapper(async (req, res, next) => {
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
  const totalRecords = await TechnicianModel.countDocuments(filter);

  // ✅ Fetch paginated results
  const technicians = await TechnicianModel.find(filter)
    .sort({ createdAt: -1 }) // latest first
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  const userData = technicians.map((item) =>
    technicianDTO(item, USER_ROLES.technician)
  );

  return SuccessMessage(res, "Technician fetched successfully", {
    userData,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageLimit),
      page: pageNumber,
      limit: pageLimit,
    },
  });
});

export const getTechnicianById = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // ✅ Fetch controller by ID where not deleted
  const technician = await TechnicianModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!technician) {
    return next(new ErrorHandler("Technician not found", 404));
  }

  // ✅ Transform data with DTO
  const userData = technicianDTO(controller, USER_ROLES.technician);

  return SuccessMessage(res, "Technician fetched successfully", userData);
});
