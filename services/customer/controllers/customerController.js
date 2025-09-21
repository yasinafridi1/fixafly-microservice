import envVariables, { USER_ROLES, USER_STATUS } from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import { sendOtpEmail } from "../shared/utils/EmailTemplates.js";
import { generateOtp, verifyOtp } from "../shared/services/OtpService.js";
import {
  generateShortToken,
  verifyShortToken,
} from "../shared/services/JwtService.js";
import { customerDto } from "../helpers/dtos.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";
import CustomerModel from "../models/CustomerModel.js";

const { authServiceUrl, updatePasswordTokenSecret } = envVariables;

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

  // ✅ Fetch customer by ID where not deleted
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

export const forgetPassword = AsyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  const user = await CustomerModel.findOne({
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

  // Block for 3 days if reached 3 OTPs in 3 days
  if (user.passwordResetTries >= 3) {
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

  const user = await CustomerModel.findOne({
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

  const user = await CustomerModel.findOne({
    _id: userData._id,
    isDeleted: false,
    status: USER_STATUS.active,
  });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  try {
    const response = await axiosInstance.post(
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
