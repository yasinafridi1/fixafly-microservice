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
  const { email, password, fcmToken } = req.body;
  console.log("Login attempt for fcmToken:", fcmToken);
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
    user.fcmToken = fcmToken;
    await user.save();
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

  const filter = { isDeleted: false };

  if (status) {
    const statusArray = Array.isArray(status)
      ? status
      : status.split(",").map((s) => s.trim().toUpperCase());
    filter.status = { $in: statusArray };
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const totalRecords = await TechnicianModel.countDocuments(filter);

  const technicians = await TechnicianModel.find(filter)
    .sort({ createdAt: -1 })
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

  // ✅ Find user by ID where not deleted
  const user = await TechnicianModel.findOne({ _id: id, isDeleted: false });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.status =
    user.status === USER_STATUS.pending
      ? USER_STATUS.active
      : user.status === USER_STATUS.active
      ? USER_STATUS.blocked
      : USER_STATUS.active;
  await user.save();

  return SuccessMessage(res, `Technician status updated successfully`, user);
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

export const getTechniciansStats = AsyncWrapper(async (req, res, next) => {
  const stats = await TechnicianModel.aggregate([
    { $match: { isDeleted: false } }, // ignore deleted technicians
    {
      $group: {
        _id: null,
        totalTechnicians: { $sum: 1 },
        activeTechnicians: {
          $sum: { $cond: [{ $eq: ["$status", USER_STATUS.active] }, 1, 0] },
        },
        blockedTechnicians: {
          $sum: { $cond: [{ $eq: ["$status", USER_STATUS.blocked] }, 1, 0] },
        },
        pendingTechnicians: {
          $sum: { $cond: [{ $eq: ["$status", USER_STATUS.pending] }, 1, 0] },
        },
      },
    },
    { $project: { _id: 0 } }, // remove _id from output
  ]);
  return SuccessMessage(res, "Technicians stats fetched successfully", stats);
});

export const forgetPassword = AsyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  const user = await TechnicianModel.findOne({
    email,
    isDeleted: false,
    status: USER_STATUS.active,
  });

  if (!user) {
    return next(new ErrorHandler("User not found or inactive", 404));
  }

  const now = new Date();

  // Check if user is blocked
  if (user.passwordResetBlockUntil && user.passwordResetBlockUntil > now) {
    const diffMs = user.passwordResetBlockUntil - now;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let messageTime;
    if (days > 0) {
      messageTime = `${days} day(s)`;
    } else if (hours > 0) {
      messageTime = `${hours} hour(s) and ${minutes} minute(s)`;
    } else {
      messageTime = `${minutes} minute(s)`;
    }

    return next(
      new ErrorHandler(
        `You have exceeded the maximum number of password reset attempts. Try again in ${messageTime}.`,
        429
      )
    );
  }

  // Reset tries if last OTP was sent more than 3 days ago
  if (
    user.lastPasswordReset &&
    now - user.lastPasswordReset > 3 * 24 * 60 * 60 * 1000
  ) {
    user.passwordResetTries = 0;
  }

  // Enforce 3-minute gap between OTPs
  if (user.lastPasswordReset && now - user.lastPasswordReset < 3 * 60 * 1000) {
    const minutesLeft = Math.ceil(
      (3 * 60 * 1000 - (now - user.lastPasswordReset)) / 60000
    );
    return next(
      new ErrorHandler(
        `Please wait ${minutesLeft} minute(s) before requesting another OTP.`,
        429
      )
    );
  }

  // Increment OTP tries
  user.passwordResetTries += 1;
  user.lastPasswordReset = now;

  // Block for 3 days if reached 5 OTPs in 3 days
  if (user.passwordResetTries >= 5) {
    user.passwordResetBlockUntil = new Date(
      now.getTime() + 3 * 24 * 60 * 60 * 1000
    );
  }

  await user.save();
  const { otp, hashedOtp, expire } = await generateOtp(email);
  // Send OTP
  await sendOtpEmail(email, otp);

  return SuccessMessage(res, "Otp sent successfully", {
    hashedOtp: `${hashedOtp}.${expire}`,
  });
});

export const OtpVerification = AsyncWrapper(async (req, res, next) => {
  const { email, hashedOtp, otp } = req.body;
  const [hash, expire] = hashedOtp.split(".");

  if (Date.now() > +expire) {
    return next(new ErrorHandler("OTP expired", 400));
  }

  const user = await TechnicianModel.findOne({
    email,
    isDeleted: false,
    status: USER_STATUS.active,
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Correct way to call verifyOtp
  const isValid = await verifyOtp(email, otp, expire, hash);

  if (!isValid) {
    return next(new ErrorHandler("Incorrect OTP", 400));
  }

  const token = generateShortToken({
    _id: user._id,
    role: user.role,
  });

  return SuccessMessage(res, "OTP verified successfully", { token });
});

export const updatePassword = AsyncWrapper(async (req, res, next) => {
  const { token, password } = req.body;
  const userData = await verifyShortToken(token);

  const user = await TechnicianModel.findOne({
    _id: userData._id,
    isDeleted: false,
    status: USER_STATUS.active,
  });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  try {
    const response = await axiosInstance.patch(
      `${authServiceUrl}/auth/long/secret/path/update/password`,
      {
        updatePasswordTokenSecret,
        password,
        token,
      }
    );
    return SuccessMessage(res, "Password updated successfully");
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});
