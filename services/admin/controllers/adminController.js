import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import envVariables, { SERVICE_STATUS } from "../config/constants.js";
import ServiceModel from "../models/ServiceModel.js";
const { customerServiceUrl, technicianServiceUrl } = envVariables;
import axiosInstance from "../shared/utils/AxiosInstance.js";

export const getAdminDashboardStats = AsyncWrapper(async (req, res, next) => {
  const stats = await ServiceModel.aggregate([
    { $match: { isDeleted: false } }, // ignore deleted services
    {
      $group: {
        _id: null,
        totalServices: { $sum: 1 },
        activeServices: {
          $sum: {
            $cond: [{ $eq: ["$status", SERVICE_STATUS.active] }, 1, 0],
          },
        },
        inactiveServices: {
          $sum: {
            $cond: [{ $eq: ["$status", SERVICE_STATUS.inactive] }, 1, 0],
          },
        },
      },
    },
    { $project: { _id: 0 } }, // remove _id from response
  ]);

  let bookingStats = null;
  try {
    const response = await axiosInstance.get(
      `${customerServiceUrl}/analytics/admin/card`,
      {
        headers: {
          Authorization: req.headers.authorization, // forward token
        },
      }
    );
    bookingStats = response?.data?.data;
  } catch (error) {
    return next(
      new ErrorHandler(
        error?.response?.data?.message ||
          error?.message ||
          "Internal Server Error",
        error?.response?.status || 500
      )
    );
  }

  let technicianStats = null;
  try {
    const response = await axiosInstance.get(
      `${technicianServiceUrl}/admin/cards/stats`,
      {
        headers: {
          Authorization: req.headers.authorization, // forward token
        },
      }
    );
    technicianStats = response?.data?.data;
  } catch (error) {
    return next(
      new ErrorHandler(
        error?.response?.data?.message ||
          error?.message ||
          "Internal Server Error",
        error?.response?.status || 500
      )
    );
  }

  return SuccessMessage(res, "Dashboard stats fetched successfully", {
    servicesStats: stats?.length ? stats[0] : null,
    bookingStats: bookingStats?.length ? bookingStats[0] : null,
    technicianStats: technicianStats?.length ? technicianStats[0] : null,
  });
});

export const getDashboardChartData = AsyncWrapper(async (req, res, next) => {
  let bookingChartData = null;
  const { year = 2025 } = req.query;
  try {
    const response = await axiosInstance.get(
      `${customerServiceUrl}/analytics/admin/chart?year=${year}`,
      {
        headers: {
          Authorization: req.headers.authorization, // forward token
        },
      }
    );
    bookingChartData = response?.data?.data;
  } catch (error) {
    return next(
      new ErrorHandler(
        error?.response?.data?.message ||
          error?.message ||
          "Internal Server Error",
        error?.response?.status || 500
      )
    );
  }

  return SuccessMessage(
    res,
    "Dashboard chart data fetched successfully",
    bookingChartData
  );
});
