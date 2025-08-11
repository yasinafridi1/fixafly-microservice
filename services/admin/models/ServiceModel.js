import mongoose from "mongoose";

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
