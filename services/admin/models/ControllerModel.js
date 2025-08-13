import mongoose from "mongoose";
import { USER_STATUS } from "../config/constants";

const controllerSchema = new mongoose.Schema({
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

controllerSchema.statics.softDeleteById = async function (id) {
  return this.updateOne({ _id: id }, { isDeleted: true });
};

const ControllerModel = mongoose.model("controller", controllerSchema);
export default ControllerModel;
