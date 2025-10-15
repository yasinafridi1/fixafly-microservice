import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import BookingModel from "../models/BookingModel.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import envVariables, {
  ORDER_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  USER_STATUS,
} from "../config/constants.js";
import { nearestTechnicianBookingAmount } from "../helpers/calculator.js";
import { locationObjBuilder } from "../helpers/location.js";
import CustomerModel from "../models/CustomerModel.js";
import Stripe from "stripe";
import { bookingAdminDTO, bookingDto } from "../helpers/dtos.js";
const { adminServiceUrl, technicianServiceUrl, stripeSecretKey } = envVariables;
const stripe = new Stripe(stripeSecretKey);

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
    const response = await axiosInstance.post(
      `${adminServiceUrl}/service/list`,
      {
        serviceIds,
      }
    );

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

  const { bookingTotalAmount, distanceInKm, totalAmountOfKM } =
    nearestTechnicianBookingAmount(mergedServices, technician);

  const locationObject = locationObjBuilder(lat, lng);

  const newBooking = new BookingModel({
    services: mergedServices,
    bookingTotalAmount,
    location: locationObject,
    comment,
    customer: req.user._id,
    date,
    time,
    distanceCharges: totalAmountOfKM,
    distanceToTechnician: distanceInKm,
  });

  const result = await newBooking.save();

  return SuccessMessage(res, "Booking initialized successfully", {
    result,
  });
});

export const getAllBookings = AsyncWrapper(async (req, res, next) => {
  let { limit = 10, page = 1, status } = req.query;
  const { role, _id } = req.user;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  let servicesData = [];

  if (role === USER_ROLES.company || role === USER_ROLES.customer) {
    filter = { customer: _id };
    if (status) {
      const statusArray = Array.isArray(status)
        ? status
        : status.split(",").map((s) => s.trim().toUpperCase());
      filter.orderStatus = { $in: statusArray };
    }
  } else if (role === USER_ROLES.technician) {
    if (uppercaseStatus) {
      filter.orderStatus = uppercaseStatus;
      if (uppercaseStatus === ORDER_STATUS.new) {
        filter.nearestTechnicians = { $in: [_id] };
      } else {
        filter.technician = _id;
      }
    } else {
      filter.technician = _id;
    }
  } else {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  // build query
  let bookingsQuery = BookingModel.find(filter)
    .select(
      "-__v -nearestTechnicians -paymentRef -amountPerKM -distanceCharges"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // only populate customer if role is NOT customer
  if (role !== USER_ROLES.customer) {
    bookingsQuery = bookingsQuery.populate(
      "customer",
      "_id fullName profilePicture email phone"
    );
  }

  const [totalRecords, bookings] = await Promise.all([
    BookingModel.countDocuments(filter),
    bookingsQuery,
  ]);

  // collect serviceIds
  const serviceIds = bookings?.length
    ? bookings.flatMap((b) => b?.services?.map((s) => s.serviceId))
    : [];

  if (serviceIds.length) {
    try {
      const response = await axiosInstance.post(
        `${adminServiceUrl}/service/list`,
        {
          serviceIds,
        }
      );
      servicesData = response?.data?.data?.servicesData || [];
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
  }

  // fetch technicians if role is company or customer
  let techniciansData = [];
  if (role === USER_ROLES.company || role === USER_ROLES.customer) {
    const technicianIds = bookings.map((b) => b.technician).filter((id) => id);
    if (technicianIds.length) {
      try {
        const response = await axiosInstance.post(
          `${technicianServiceUrl}/getMultiTechnicians`,
          { technicianIds }
        );
        techniciansData = response?.data?.data || [];
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
    }
  }

  const mappedResult = bookingDto(bookings, servicesData, techniciansData);

  return SuccessMessage(res, "Bookings fetched successfully", {
    bookingsData: mappedResult,
    paginations: {
      totalRecords,
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
    },
  });
});

export const checkoutSession = AsyncWrapper(async (req, res, next) => {
  const booking = await BookingModel.findOne({
    _id: req.body.orderId,
    customer: req.user._id,
    paymentStatus: PAYMENT_STATUS.pending,
  }).select("services bookingTotalAmount paymentStatus distanceCharges");

  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (booking?.paymentStatus === PAYMENT_STATUS.paid) {
    return next(new ErrorHandler("Booking payment is paid already", 400));
  }

  const serviceIds = booking?.services?.map((item) => item?.serviceId);
  let servicesData = [];

  if (serviceIds?.length) {
    try {
      const response = await axiosInstance.post(
        `${adminServiceUrl}/service/list`,
        {
          serviceIds: serviceIds,
        }
      );
      servicesData = response?.data?.data?.servicesData || [];
    } catch (error) {
      error.statusCode = error.response?.status || 500;
      error.message =
        error?.response?.data?.message ||
        error?.message ||
        "Internal Server Error";
      return next(error);
    }
  }

  // Merge booking.services with servicesData
  const serviceMap = {};
  servicesData.forEach((srv) => {
    serviceMap[srv._id] = srv;
  });

  const mergedServices = booking.services.map((s) => {
    const full = serviceMap[s.serviceId] || {};
    return {
      _id: s.serviceId,
      quantity: s.quantity,
      price: s.price,
      name: full.name,
      image: full.image,
    };
  });

  // Build line_items for Stripe checkout
  const line_items = mergedServices.map((item) => ({
    price_data: {
      currency: "usd", // or "sar" depending on your needs
      unit_amount: Math.round(item.price * 100), // convert to cents
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
    },
    quantity: item.quantity,
  }));

  line_items.push({
    price_data: {
      currency: "usd",
      unit_amount: Math.round(booking.distanceCharges * 100),
      product_data: {
        name: "Distance Charges",
        description: "Includes taxes, service fee, etc.",
      },
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `http://local:3000/payment-success`,
    cancel_url: `http://local:3000/payment-cancel`,
    metadata: {
      orderId: booking._id.toString(),
    },
  });

  return SuccessMessage(res, "Checkout session created successfully", {
    checkoutUrl: session.url, // you can send this to frontend to redirect user
  });
});

export const deleteBooking = AsyncWrapper(async (req, res, next) => {
  const { bookingId } = req.params;
  const booking = await BookingModel.findOneAndDelete({
    _id: bookingId,
    customer: req.user._id,
    orderStatus: ORDER_STATUS.new,
  });

  if (!booking) {
    return next(
      new ErrorHandler("Booking not found or cannot be deleted", 404)
    );
  }

  return SuccessMessage(res, "Booking deleted successfully");
});

export const updateBookingStatus = AsyncWrapper(async (req, res, next) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const { _id } = req.user;

  const booking = await BookingModel.findOne({ _id: bookingId });
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (
    booking.orderStatus === ORDER_STATUS.new &&
    status === ORDER_STATUS.accepted
  ) {
    if (booking.nearestTechnicians.includes(_id)) {
      booking.technician = _id;
      booking.orderStatus = status;
    } else {
      return next(
        new ErrorHandler("You are not authorized for this action", 403)
      );
    }
  } else if (
    booking.orderStatus === ORDER_STATUS.accepted &&
    status === ORDER_STATUS.inProgress
  ) {
    if (booking.technician === _id) {
      booking.orderStatus = status;
    } else {
      return next(
        new ErrorHandler("You are not authorized for this action", 403)
      );
    }
  } else if (
    booking.orderStatus === ORDER_STATUS.inProgress &&
    status === ORDER_STATUS.completed
  ) {
    if (booking.technician === _id) {
      booking.orderStatus = status;
    } else {
      return next(
        new ErrorHandler("You are not authorized for this action", 403)
      );
    }
  } else {
    return next(new ErrorHandler("Invalid status transition", 400));
  }

  await booking.save();
  return SuccessMessage(res, "Booking status updated successfully");
});

export const allBookingAdmin = AsyncWrapper(async (req, res, next) => {
  let { limit = 10, page = 1, status } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};

  if (status) {
    const statusArray = Array.isArray(status)
      ? status
      : status.split(",").map((s) => s.trim().toUpperCase());
    filter.orderStatus = { $in: statusArray };
  }

  // build query
  let bookingsQuery = BookingModel.find(filter)
    .select(
      "_id bookingTotalAmount customer technician paymentStatus orderStatus date time"
    )
    .populate("customer", "_id fullName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const [totalRecords, bookings] = await Promise.all([
    BookingModel.countDocuments(filter),
    bookingsQuery,
  ]);

  // fetch technicians if role is company or customer
  let techniciansData = [];
  const technicianIds = bookings?.map((b) => b.technician).filter((id) => id);
  if (technicianIds.length) {
    try {
      const response = await axiosInstance.post(
        `${technicianServiceUrl}/getMultiTechnicians`,
        { technicianIds }
      );
      techniciansData = response?.data?.data || [];
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
  }

  const mappedResult = bookingAdminDTO(bookings, techniciansData);

  return SuccessMessage(res, "Bookings fetched successfully", {
    bookingsData: mappedResult,
    paginations: {
      totalRecords,
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
    },
  });
});

export const deleteBookingAdmin = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const booking = await BookingModel.findOneAndDelete({
    _id: id,
  });

  if (!booking) {
    return next(
      new ErrorHandler("Booking not found or cannot be deleted", 404)
    );
  }

  return SuccessMessage(res, "Booking deleted successfully");
});

export const updateBookingAdmin = AsyncWrapper(async (req, res, next) => {
  const { bookingId } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const booking = await BookingModel.findOne({ _id: bookingId });
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  booking.orderStatus = orderStatus;
  booking.paymentStatus = paymentStatus;
  await booking.save();
  return SuccessMessage(res, "Booking status updated successfully", booking);
});

export const bookingDetailAdmin = AsyncWrapper(async (req, res, next) => {
  return SuccessMessage(res, "Booking Detail fetched successfully");
});
