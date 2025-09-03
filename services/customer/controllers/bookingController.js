import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import BookingModel from "../models/BookingModel.js";

export const initializeBooking = AsyncWrapper(async (req, res, next) => {
  const { services, date, time, comment, lat, lng } = req.body;

  // fetch services detail

  // find total amount based on nearest technician
});

export const getAllBookings = AsyncWrapper(async (req, res, next) => {});

export const getCustomersBooking = AsyncWrapper(async (req, res, next) => {});

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
