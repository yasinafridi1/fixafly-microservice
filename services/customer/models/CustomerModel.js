import mongoose from "mongoose";
import { USER_STATUS } from "../config/constants.js";

const customerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  vatNumber: {
    type: String,
    required: false,
  },
  fcmToken: {
    type: String,
    required: false,
    default: null,
  },
  profilePicture: {
    type: String,
    required: false,
    default: null,
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.active,
  },
  role: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  passwordResetTries: { type: Number, default: 0 },
  lastPasswordReset: { type: Date },
  passwordResetBlockUntil: { type: Date },
});

customerSchema.statics.softDeleteById = async function (id) {
  return this.updateOne({ _id: id }, { isDeleted: true });
};

const CustomerModel = mongoose.model("customer", customerSchema);
export default CustomerModel;
