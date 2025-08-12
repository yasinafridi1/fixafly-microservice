import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
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

const AdminModel = mongoose.model("admin", adminSchema);
export default AdminModel;
