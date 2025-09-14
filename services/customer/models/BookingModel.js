import mongoose from "mongoose";
import {
  AMOUNT_PER_KM,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../config/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    services: [
      {
        serviceId: {
          type: String,
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    amountPerKM: {
      type: Number,
      default: AMOUNT_PER_KM,
    },
    bookingTotalAmount: {
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
      type: String,
      ref: "customer",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.pending,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.new,
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
