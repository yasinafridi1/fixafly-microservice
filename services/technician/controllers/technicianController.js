import envVariables, { USER_ROLES, USER_STATUS } from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import TechnicianModel from "../models/TechnicianModel.js";
import { technicianDTO } from "../helpers/dtos.js";
import uploadFileToS3, {
  uploadFileAndIdCardToS3,
  deleteFileFromS3,
} from "../shared/utils/AwsUtil.js";
import { locationObjBuilder } from "../helpers/location.js";
const { authServiceUrl, customerServiceUrl } = envVariables;

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await TechnicianModel.findOne({ email, isDeleted: false });
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 400));
  }

  if (user.status === USER_STATUS.pending) {
    return next(new ErrorHandler("Your account is under verification.", 400));
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
    const userData = technicianDTO(user, role);
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
  const { email, role, fullName, password, lat, lng, phone } = req.body;
  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signup`, {
      email,
      password,
      role,
    });
    const { data } = response?.data;

    const { fileUrl, idCardUrl } = await uploadFileAndIdCardToS3(req.files);

    const location = locationObjBuilder(lat, lng);
    const newTechnician = new TechnicianModel({
      _id: data._id,
      fullName: fullName,
      email,
      location,
      phone,
      profilePicture: fileUrl,
      idCard: idCardUrl,
    });
    const result = await newTechnician.save();
    const userData = technicianDTO(result, USER_ROLES.technician);
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

  const technician = await TechnicianModel.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!technician) {
    return next(new ErrorHandler("Technician not found", 404));
  }

  const location = locationObjBuilder(lat, lng);

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
  technician.location = location;
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

  // ✅ Fetch technician by ID where not deleted
  const technician = await TechnicianModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!technician) {
    return next(new ErrorHandler("Technician not found", 404));
  }

  // ✅ Transform data with DTO
  const userData = technicianDTO(technician, USER_ROLES.technician);

  return SuccessMessage(res, "Technician fetched successfully", userData);
});

export const updateTechnicianStatus = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // ✅ Find user by ID where not deleted
  const user = await TechnicianModel.findOne({ _id: id, isDeleted: false });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // ✅ Update status
  user.status = status;
  await user.save();

  return SuccessMessage(
    res,
    `Technician status updated to ${status} successfully`
  );
});

export const getNearestTechnician = AsyncWrapper(async (req, res, next) => {
  const { lat, lng, limit = 1 } = req.query;

  const nearest = await TechnicianModel.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: "distance",
        spherical: true, // use spherical distance calculation
      },
    },
    {
      $match: { isDeleted: false, status: USER_STATUS.active },
    },
    {
      $limit: parseInt(limit), // apply limit here
    },
  ]);
  return SuccessMessage(res, "Nearest found successfully", nearest);
});

export const getDashboardCardData = AsyncWrapper(async (req, res, next) => {
  try {
    const response = await axiosInstance.get(
      `${customerServiceUrl}/analytics/technician/${req.user._id}`
    );

    return SuccessMessage(
      res,
      "Dashboard data fetched successfully",
      response?.data?.data
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

export const getDashboardChartData = AsyncWrapper(async (req, res, next) => {
  try {
    const response = await axiosInstance.get(
      `${customerServiceUrl}/analytics/technician/chart/${req.user._id}`
    );

    return SuccessMessage(
      res,
      "Chart data fetched successfully",
      response?.data?.data
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

export const getMultiTechnicians = AsyncWrapper(async (req, res, next) => {
  const { technicianIds } = req.body;
  const technicians = await TechnicianModel.find({
    _id: { $in: technicianIds },
    isDeleted: false,
  }).select("_id fullName profilePicture email phone");
  return SuccessMessage(res, "Technicians fetched successfully", technicians);
});
