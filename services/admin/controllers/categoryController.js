import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import ServiceModel from "../models/ServiceModel.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";
import { serviceDTO } from "../helpers/dtos.js";
import { SERVICE_STATUS } from "../config/constants.js";

export const addCategory = AsyncWrapper(async (req, res, next) => {
  const { name, description, price, status, visibilityStatus } = req.body;
  const lowerCaseName = name.toLowerCase();
  const isExist = await ServiceModel.findOne({ name: lowerCaseName });
  if (isExist) {
    return next(new ErrorHandler("Service already exists", 400));
  }

  const url = await uploadFileToS3(req.file);

  const service = new ServiceModel({
    name: lowerCaseName,
    description,
    price,
    image: url,
    status,
    visibilityStatus,
  });

  const result = await service.save();
  if (!result) {
    return next(new ErrorHandler("Failed to add category", 500));
  }
  return SuccessMessage(res, "Service added successfully", {
    serviceData: serviceDTO(result),
  });
});

export const getAllCategories = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const pageLimit = parseInt(limit, 10) || 10;

  const filter = { isDeleted: false, status: SERVICE_STATUS.active };

  if (search) {
    filter.name = { $regex: search, $options: "i" }; // case-insensitive
  }

  const totalRecords = await ServiceModel.countDocuments(filter);

  const categories = await ServiceModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  const serviceData = categories.map((item) => serviceDTO(item));

  return SuccessMessage(res, "Services fetched successfully", {
    serviceData,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageLimit),
      page: pageNumber,
      limit: pageLimit,
    },
  });
});

export const deleteCategory = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const category = await ServiceModel.findById(id);
  if (!category) {
    return next(new ErrorHandler("Service not found", 404));
  }

  if (category.image) {
    await deleteFileFromS3(category.image);
  }

  category.isDeleted = true;
  await category.save();

  return SuccessMessage(res, "Service deleted successfully");
});

export const updateCategory = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, status, visibilityStatus } = req.body;

  const category = await ServiceModel.findOne({ _id: id, isDeleted: false });
  if (!category) {
    return next(new ErrorHandler("Service not found", 404));
  }

  let imageUrl = category.image;
  if (req.file) {
    if (category.image) {
      await deleteFileFromS3(category.image);
    }

    imageUrl = await uploadFileToS3(req.file);
  }

  category.name = name ? name.toLowerCase() : category.name;
  category.description = description || category.description;
  category.price = price !== undefined ? price : category.price;
  category.image = imageUrl;
  category.status = status ? status : category.status;
  category.visibilityStatus = visibilityStatus;

  await category.save();

  return SuccessMessage(res, "Service updated successfully", {
    serviceData: serviceDTO(category),
  });
});

export const getCategoryById = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const category = await ServiceModel.findOne({ _id: id, isDeleted: false });

  if (!category) {
    return next(new ErrorHandler("Service not found", 404));
  }

  return SuccessMessage(res, "Service detail fetched successfully", {
    serviceData: serviceDTO(category),
  });
});

export const getCategoriesByIds = AsyncWrapper(async (req, res, next) => {
  let ids = req.body.serviceIds;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(
      new ErrorHandler("Please provide an array of service IDs", 400)
    );
  }
  ids = Array.from(new Set(ids));

  // Find services that match the IDs and are not deleted
  const services = await ServiceModel.find({
    _id: { $in: ids },
    isDeleted: false,
  });

  if (services?.length !== ids.length) {
    return next(new ErrorHandler("Service not found", 404));
  }

  return SuccessMessage(res, "Services fetched successfully", {
    servicesData: services.map((service) => serviceDTO(service)),
  });
});

export const getAllCategoriesAdmin = AsyncWrapper(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    visibilityStatus,
  } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const pageLimit = parseInt(limit, 10) || 10;

  const filter = { isDeleted: false };

  if (status) {
    const statusArray = Array.isArray(status)
      ? status
      : status.split(",").map((s) => s.trim().toUpperCase());
    filter.status = { $in: statusArray };
  }

  if (visibilityStatus) {
    const visibilityArray = Array.isArray(visibilityStatus)
      ? visibilityStatus
      : visibilityStatus.split(",").map((v) => v.trim().toUpperCase());
    filter.visibilityStatus = { $in: visibilityArray };
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const totalRecords = await ServiceModel.countDocuments(filter);

  const categories = await ServiceModel.find(filter)
    .sort({ _id: -1 })
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  const serviceData = categories.map((item) => serviceDTO(item));

  return SuccessMessage(res, "Services fetched successfully", {
    serviceData,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageLimit),
      page: pageNumber,
      limit: pageLimit,
    },
  });
});
