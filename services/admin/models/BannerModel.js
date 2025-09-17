import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const BannerModel = mongoose.model("Banner", querySchema);

export default BannerModel;
