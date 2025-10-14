import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    by: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
    },
    userEmail: {
      type: String,
      required: false,
    },
    attachment: {
      type: String,
      required: false,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const QueryModel = mongoose.model("Query", querySchema);

export default QueryModel;
