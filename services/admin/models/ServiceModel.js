import mongoose from "mongoose";
import {
  SERVICE_STATUS,
  SERVICE_VISIBILITY_STATUS,
} from "../config/constants.js";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(SERVICE_STATUS),
    default: SERVICE_STATUS.active,
  },
  visibilityStatus: {
    type: String,
    enum: Object.values(SERVICE_VISIBILITY_STATUS),
    default: SERVICE_VISIBILITY_STATUS.private,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

serviceSchema.statics.softDeleteById = function (id) {
  return this.updateOne({ _id: id }, { isDeleted: true });
};

const ServiceModel = mongoose.model("service", serviceSchema);
export default ServiceModel;
