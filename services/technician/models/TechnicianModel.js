import mongoose from "mongoose";
import { USER_STATUS } from "../config/constants.js";

const technicianSchema = new mongoose.Schema({
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
    default: USER_STATUS.pending,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  idCard: {
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

technicianSchema.index({ location: "2dsphere" });

technicianSchema.statics.softDeleteById = async function (id) {
  return this.updateOne({ _id: id }, { isDeleted: true });
};

const TechnicianModel = mongoose.model("technician", technicianSchema);
export default TechnicianModel;
