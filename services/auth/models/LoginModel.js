import mongoose from "mongoose";
import { USER_ROLES } from "../config/constants.js";
import CounterModel from "./CounterModel.js";

const loginSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.customer,
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

loginSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Increment counter for this model
    const counter = await CounterModel.findOneAndUpdate(
      { model: "login" }, // Fixed model name for counter
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    // Pad number to always have 3 digits
    const paddedId = counter.count.toString().padStart(3, "0");
    this._id = paddedId;
  }
  next();
});

const LoginModel = mongoose.model("login", loginSchema);

export default LoginModel;
