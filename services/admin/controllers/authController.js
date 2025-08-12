import envVariables from "../config/constants.js";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";

const { authServiceUrl } = envVariables;

export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const response = await axiosInstance.post(`${authServiceUrl}/auth/signin`, {
      email,
      password,
    });
    console.log("Response ===>", response);
    return SuccessMessage(res, "Logged in successfully");
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }
});
