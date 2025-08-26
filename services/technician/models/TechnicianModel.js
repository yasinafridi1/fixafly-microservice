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
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
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
    default: USER_STATUS.blocked,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

technicianSchema.statics.softDeleteById = async function (id) {
  return this.updateOne({ _id: id }, { isDeleted: true });
};

const TechnicianModel = mongoose.model("technician", technicianSchema);
export default TechnicianModel;
