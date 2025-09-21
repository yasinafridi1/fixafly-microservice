import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import BookingModel from "../models/BookingModel.js";
import { ORDER_STATUS } from "../config/constants.js";

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

  const result = months.map((monthName, i) => {
    const monthData = monthlyData.find((m) => m._id.month === i + 1);
    return {
      month: monthName,
      income: monthData ? monthData.totalIncome : 0,
    };
  });

  return SuccessMessage(res, "Chart data fetched successfully", result);
});
