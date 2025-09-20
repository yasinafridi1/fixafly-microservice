import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import QueryModel from "../models/QueryModel.js";
import uploadFileToS3 from "../shared/utils/AwsUtil.js";
import { USER_ROLES } from "../config/constants.js";

export const addQuery = AsyncWrapper(async (req, res, next) => {
  const { subject, comment } = req.body;

  let attachment = null;
  if (req.file) {
    attachment = await uploadFileToS3(req.file);
  }

  const newQuery = new QueryModel({
    subject,
    by: req.user._id,
    comment,
    attachment,
  });

  const result = await newQuery.save();

  return SuccessMessage(res, "Query added successfully", result);
});

export const getQueryDetail = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const query = await QueryModel.findById(id);
  if (!query) {
    return next(new ErrorHandler("Query not found", 404));
  }
  if (!query.isViewed) {
    query.isViewed = true;
    await query.save();
  }
  return SuccessMessage(res, "Query fetched successfully", query);
});

export const markResolved = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const query = await QueryModel.findById(id);
  if (!query) {
    return next(new ErrorHandler("Query not found", 404));
  }
  query.isReplied = true;
  query.isViewed = true;
  await query.save();
  return SuccessMessage(res, "Query marked as resolved", query);
});

export const deleteQuery = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const query = await QueryModel.findById(id);
  if (!query) {
    return next(new ErrorHandler("Query not found", 404));
  }
  await QueryModel.deleteOne({ _id: id });
  return SuccessMessage(res, "Query deleted successfully");
});

export const getAllQueries = AsyncWrapper(async (req, res, next) => {
  let queries = [];
  if (
    req.user.role === USER_ROLES.customer ||
    req.user.role === USER_ROLES.controller
  ) {
    queries = await QueryModel.find({ by: req.user._id }).sort({
      createdAt: -1,
    });
  } else {
    queries = await QueryModel.find().sort({ createdAt: -1 });
  }
  return SuccessMessage(res, "Queries fetched successfully", queries);
});
