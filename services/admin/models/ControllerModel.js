import mongoose from "mongoose";

const controllerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: true,
  },
  fcmToken: {
    type: String,
    required: false,
    default: null,
  },
  passwordTries: {
    type: Number,
    default: 0,
    required: false,
  },
  lockUntil: {
    type: Date,
    default: null, // Date after which the account unlocks
  },
});

const ControllerModel = mongoose.model("controller", controllerSchema);
export default ControllerModel;
