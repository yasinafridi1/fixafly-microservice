import envVariables from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import AdminModel from "../models/AdminModel.js";
import { adminDTO } from "../helpers/dtos.js";

const { authServiceUrl } = envVariables;

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signin`, {
      email,
      password,
    });
    const { data } = response.data;
    const { accessToken, refreshToken, role } = data;
    const user = await AdminModel.findOne({ email });
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
