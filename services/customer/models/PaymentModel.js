import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  payment_intent: {
    type: String,
    required: true,
  },
  customer_details: {
    type: Object,
    required: true,
  },
  amount_total: {
    type: Number,
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "booking",
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
});

const PaymentModel = mongoose.model("payment", paymentSchema);

export default PaymentModel;
