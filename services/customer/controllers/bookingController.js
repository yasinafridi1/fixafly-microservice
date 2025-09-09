import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import BookingModel from "../models/BookingModel.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import envVariables, {
  ORDER_STATUS,
  USER_STATUS,
} from "../config/constants.js";
import { nearestTechnicianBookingAmount } from "../helpers/calculator.js";
import { locationObjBuilder } from "../helpers/location.js";
import CustomerModel from "../models/CustomerModel.js";

const { adminServiceUrl, technicianServiceUrl } = envVariables;

export const initializeBooking = AsyncWrapper(async (req, res, next) => {
  const { services, date, time, comment, lat, lng } = req.body;

  const customer = await CustomerModel.findOne({
    _id: req.user._id,
    status: USER_STATUS.active,
    isDeleted: false,
  });
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  const serviceIds = services.map((item) => item.id);

  let serviceData = [];

  // fetch services detail
  try {
    const response = await axiosInstance.post(`${adminServiceUrl}/list`, {
      serviceIds,
    });

    serviceData = response?.data?.data?.servicesData;
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }

  if (!serviceData) {
    return next(new ErrorHandler("Service not found", 404));
  }

  // fetch nearest technician
  let technician = {};
  try {
    const response = await axiosInstance.get(
      `${technicianServiceUrl}/nearest?lng=${lng}&lat=${lat}&limit=${1}`
    );
    if (!response?.data?.data?.length) {
      return next(new ErrorHandler("No technician found for now", 404));
    }
    technician = response?.data?.data[0];
  } catch (error) {
    error.statusCode = error.response?.status || 500;
    error.message =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";
    return next(error);
  }

  const mergedServices = services.map((item) => {
    const matchedService = serviceData.find((s) => s._id === item.id);

    if (!matchedService) {
      throw new Error(`Service with id ${item.id} not found in serviceData`);
    }

    return {
      serviceId: item.id,
      quantity: item.quantity,
      price: matchedService.price, // take price from serviceData
    };
  });

  const bookingTotalAmount = nearestTechnicianBookingAmount(
    mergedServices,
    technician
  );

  const locationObject = locationObjBuilder(lat, lng);

  const newBooking = new BookingModel({
    services: mergedServices,
    bookingTotalAmount,
    location: locationObject,
    comment,
    customer: req.user._id,
    date,
    time,
  });

  const result = await newBooking.save();

  return SuccessMessage(res, "Booking initialized successfully", {
    result,
  });
  // find total amount based on nearest technician
});

export const getAllBookings = AsyncWrapper(async (req, res, next) => {});

export const getCustomerBookings = AsyncWrapper(async (req, res, next) => {
  let { limit = 10, page = 1, status } = req.query;
  // Check if customer exists
  const customer = await CustomerModel.findOne({
    _id: req.user._id,
    status: USER_STATUS.active,
    isDeleted: false,
  });
  if (!customer) {
    return next(new ErrorHandler("Customer not found", 404));
  }

  // Convert to integers
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { customer: req.user._id };
  if (status) {
    const statusUpper = status.toUpperCase();
    if (Object.values(ORDER_STATUS).includes(statusUpper)) {
      filter.orderStatus = statusUpper;
    }
  }

  // Total count for pagination
  const total = await BookingModel.countDocuments(filter);

  // Fetch bookings with pagination
  const bookings = await BookingModel.find(filter)
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(limit)
    .populate("technician")
    .populate("services.serviceId");

  return SuccessMessage(res, "Customer bookings fetched successfully", {
    bookingsData: bookings,
    paginations: {
      totalRecords: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getTechnicianBookings = AsyncWrapper(async (req, res, next) => {
  const userId = req.user._id;
  const bookings = await BookingModel.find({ technician: userId });

  return SuccessMessage(
    res,
    "Technicians booking fetched successfully",
    bookings
  );
});

export const updateBookingStatus = AsyncWrapper(async (req, res, next) => {});
