import mongoose from "mongoose";
import { BOOKING_STATUS, ORDER_STATUS } from "../config/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    comment: {
      type: String,
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.pending,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.pending,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("booking", bookingSchema);

export default BookingModel;
