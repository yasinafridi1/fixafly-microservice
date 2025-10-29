import envVariables from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import AdminModel from "../models/AdminModel.js";
import { adminDTO } from "../helpers/dtos.js";

const { authServiceUrl } = envVariables;

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password, fcmToken } = req.body;

  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signin`, {
      email,
      password,
    });
    const { data } = response.data;
    const { accessToken, refreshToken, role } = data;
    const user = await AdminModel.findOne({ email });
    user.fcmToken = fcmToken;
    await user.save();
    const userData = adminDTO(user, role);
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

export const register = AsyncWrapper(async (req, res, next) => {
  const { email, password, role, fullName } = req.body;
  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signup`, {
      email,
      password,
      role,
    });
    const { data } = response?.data;
    const newAdmin = new AdminModel({
      _id: data._id,
      fullName: fullName,
      email,
    });
    await newAdmin.save();
    return SuccessMessage(res, "signup successfully successfully");
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});

export const autoLogin = AsyncWrapper(async (req, res, next) => {
  const { refreshToken: refreshTokenFromBody } = req.body;

  try {
    const response = await axiosInstance.post(
      `${authServiceUrl}/auth/refresh_session`,
      {
        refreshToken: refreshTokenFromBody,
      }
    );
    const { data } = response.data;
    const { accessToken, refreshToken, role, _id } = data.userData;
    const user = await AdminModel.findById(_id);
    const userData = adminDTO(user, role);
    return SuccessMessage(res, "Session refreshed", {
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

export const logoutAdmin = AsyncWrapper(async (req, res, next) => {
  try {
    await axiosInstance.get(`${authServiceUrl}/auth/logout/${req.user._id}`);
    return SuccessMessage(res, "Logout successfully");
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});
