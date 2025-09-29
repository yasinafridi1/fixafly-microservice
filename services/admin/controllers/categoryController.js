import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AsyncWrapper from "../shared/utils/AsyncWrapper.js";
import ErrorHandler from "../shared/utils/ErrorHandler.js";
import ServiceModel from "../models/ServiceModel.js";
import uploadFileToS3, { deleteFileFromS3 } from "../shared/utils/AwsUtil.js";
import { serviceDTO } from "../helpers/dtos.js";
import { SERVICE_STATUS } from "../config/constants.js";

export const addCategory = AsyncWrapper(async (req, res, next) => {
  const { name, description, price, status } = req.body;
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

  // ✅ Build filter query
  const filter = { isDeleted: false, status: SERVICE_STATUS.active };

  // ✅ Search filter (by category name)
  if (search) {
    filter.name = { $regex: search, $options: "i" }; // case-insensitive
  }

  // ✅ Count total categories
  const totalRecords = await ServiceModel.countDocuments(filter);

  // ✅ Fetch paginated results
  const categories = await ServiceModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  // ✅ Transform data with DTO
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

  // Find the category first
  const category = await ServiceModel.findById(id);
  if (!category) {
    return next(new ErrorHandler("Service not found", 404));
  }

  // Delete image from S3 if exists
  if (category.image) {
    await deleteFileFromS3(category.image);
  }

  // Soft delete the category
  category.isDeleted = true;
  await category.save();

  return SuccessMessage(res, "Service deleted successfully");
});

export const updateCategory = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, status } = req.body;

  // Find the category first
  const category = await ServiceModel.findOne({ _id: id, isDeleted: false });
  if (!category) {
    return next(new ErrorHandler("Service not found", 404));
  }

  // Check for new image
  let imageUrl = category.image;
  if (req.file) {
    // Delete previous image from S3 if exists
    if (category.image) {
      await deleteFileFromS3(category.image);
    }
    // Upload new image
    imageUrl = await uploadFileToS3(req.file);
  }

  // Update category
  category.name = name ? name.toLowerCase() : category.name;
  category.description = description || category.description;
  category.price = price !== undefined ? price : category.price;
  category.image = imageUrl;
  category.status = status ? status : category.status;

  await category.save();

  return SuccessMessage(res, "Service updated successfully", {
    serviceData: serviceDTO(category),
  });
});

export const getCategoryById = AsyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // Find category by ID and not deleted
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
  const { page = 1, limit = 10, search = "", status } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const pageLimit = parseInt(limit, 10) || 10;

  // ✅ Build filter query
  const filter = { isDeleted: false };

  if (status) {
    filter.status = status.toUpperCase();
  }

  // ✅ Search filter (by category name)
  if (search) {
    filter.name = { $regex: search, $options: "i" }; // case-insensitive
  }

  // ✅ Count total categories
  const totalRecords = await ServiceModel.countDocuments(filter);

  // ✅ Fetch paginated results
  const categories = await ServiceModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageLimit)
    .limit(pageLimit);

  // ✅ Transform data with DTO
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
