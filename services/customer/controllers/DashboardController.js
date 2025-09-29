import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import BookingModel from "../models/BookingModel.js";
import { ORDER_STATUS } from "../config/constants.js";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getTechnicianDashboardCard = AsyncWrapper(
  async (req, res, next) => {
    const { technicianId } = req.params;
    const stats = await BookingModel.aggregate([
      { $match: { technician: technicianId } },
      {
        $facet: {
          totalAmount: [
            { $match: { orderStatus: ORDER_STATUS.completed } },
            {
              $group: {
                _id: null,
                total: { $sum: "$bookingTotalAmount" },
              },
            },
          ],
          completedOrders: [
            { $match: { orderStatus: ORDER_STATUS.completed } },
            { $count: "count" },
          ],
          pendingOrders: [
            { $match: { orderStatus: ORDER_STATUS.accepted } },
            { $count: "count" },
          ],
          ongoingOrders: [
            { $match: { orderStatus: ORDER_STATUS.inProgress } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const result = {
      totalAmount: stats[0]?.totalAmount[0]?.total || 0,
      completedOrders: stats[0]?.completedOrders[0]?.count || 0,
      pendingOrders: stats[0]?.pendingOrders[0]?.count || 0,
      ongoingOrders: stats[0]?.ongoingOrders[0]?.count || 0,
    };

    return SuccessMessage(res, "Dashboard data fetched successfully", result);
  }
);

export const getTechnicianChartData = AsyncWrapper(async (req, res, next) => {
  const { technicianId } = req.params;
  const { year = 2025 } = req.query;

  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);

  const monthlyData = await BookingModel.aggregate([
    {
      $match: {
        technician: technicianId,
        orderStatus: ORDER_STATUS.completed,
        date: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$date" } },
        totalIncome: { $sum: "$bookingTotalAmount" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const result = months.map((monthName, i) => {
    const monthData = monthlyData.find((m) => m._id.month === i + 1);
    return {
      month: monthName,
      income: monthData ? monthData.totalIncome : 0,
    };
  });

  return SuccessMessage(res, "Chart data fetched successfully", result);
});

export const adminChartData = AsyncWrapper(async (req, res, next) => {
  console.log("Admin chart data request received");
  const { year } = req.query;

  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);

  const monthlyData = await BookingModel.aggregate([
    {
      $match: {
        orderStatus: ORDER_STATUS.completed,
        date: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$date" } },
        totalIncome: { $sum: "$bookingTotalAmount" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  console.log("Monthly data:", monthlyData);

  const result = months.map((monthName, i) => {
    const monthData = monthlyData.find((m) => m._id.month === i + 1);
    return {
      month: monthName,
      income: monthData ? monthData.totalIncome : 0,
    };
  });

  return SuccessMessage(res, "Admin chart data fetched successfully", result);
});

export const adminStats = AsyncWrapper(async (req, res, next) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = await BookingModel.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", ORDER_STATUS.completed] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", ORDER_STATUS.inProgress] }, 1, 0],
          },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$orderStatus", ORDER_STATUS.new] }, 1, 0] },
        },
        totalRevenue: {
          $sum: "$bookingTotalAmount",
        },
        revenueThisYear: {
          $sum: {
            $cond: [{ $gte: ["$date", startOfYear] }, "$bookingTotalAmount", 0],
          },
        },
        revenueThisMonth: {
          $sum: {
            $cond: [
              { $gte: ["$date", startOfMonth] },
              "$bookingTotalAmount",
              0,
            ],
          },
        },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return SuccessMessage(res, "Booking stats fetched successfully", stats);
});
