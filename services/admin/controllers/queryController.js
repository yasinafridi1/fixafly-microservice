import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import QueryModel from "../models/QueryModel.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";
import { USER_ROLES } from "../config/constants.js";

export const addQuery = AsyncWrapper(async (req, res, next) => {
  const { subject, comment, email } = req.body;

  let attachment = null;
  if (req.file) {
    attachment = await uploadFileToS3(req.file);
  }

  const newQuery = new QueryModel({
    subject,
    by: req.user._id,
    role: req.user.role,
    userEmail: email,
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

  if (query?.attachment) {
    await deleteFileFromS3(query?.attachment);
  }

  await QueryModel.deleteOne({ _id: id });
  return SuccessMessage(res, "Query deleted successfully");
});

export const getAllQueries = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, isReplied } = req.query;

  const skip = (page - 1) * limit;

  const filter = {};

  if (
    req.user.role === USER_ROLES.customer ||
    req.user.role === USER_ROLES.controller
  ) {
    filter.by = req.user._id;
  }

  if (isReplied !== undefined) {
    if (Array.isArray(isReplied)) {
      const boolValues = isReplied.map((v) => v === "true");
      filter.isReplied = { $in: boolValues };
    } else {
      filter.isReplied = isReplied === "true";
    }
  }

  const queries = await QueryModel.find(filter)
    .sort({ isReplied: 1, createdAt: -1 }) // unreplied first, then latest
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination info
  const totalCount = await QueryModel.countDocuments(filter);

  return SuccessMessage(res, "Queries fetched successfully", {
    paginations: {
      totalRecords: totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      limit,
    },
    queries,
  });
});
