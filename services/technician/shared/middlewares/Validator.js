import AsyncWrapper from "../utils/AsyncWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Joi from "joi";

const fileSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required().messages({
    "string.empty": "File name cannot be empty",
    "any.required": "File name is required",
  }),
  mimetype: Joi.string()
    .valid("image/jpeg", "image/png", "image/jpg", "application/octet-stream")
    .required()
    .messages({
      "any.only": "File must be a JPEG, PNG, or JPG image",
      "any.required": "File type is required",
    }),
  size: Joi.number()
    .max(5 * 1024 * 1024) // 5 MB
    .required()
    .messages({
      "number.max": "File size must not exceed 5 MB",
      "any.required": "File size is required",
    }),
}).unknown(true);

const fileValidation = {
  file: fileSchema,
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      error.isJoi = true; // add joi flag
      throw error;
    }

    next();
  };
};

export const fileValidator = AsyncWrapper(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Profile picture is required", 422));
  }
  const { error } = fileValidation.file.validate(req.file);
  if (error) {
    return next(new ErrorHandler(`File error: ${error.message}`, 422));
  }
  next();
});

export const fileAndIdCardValidator = AsyncWrapper(async (req, res, next) => {
  const file = req.files?.file?.[0];
  const idCard = req.files?.idCard?.[0];

  if (!file) {
    return next(new ErrorHandler("Profile picture is required", 422));
  }

  if (!idCard) {
    return next(new ErrorHandler("NIC picture is required", 422));
  }

  // Validate both
  const fileError = fileValidation.file.validate(file).error;
  const idCardError = fileValidation.file.validate(idCard).error;

  if (fileError) {
    return next(new ErrorHandler(`File error: ${fileError.message}`, 422));
  }
  if (idCardError) {
    return next(new ErrorHandler(`ID Card error: ${idCardError.message}`, 422));
  }

  next();
});

export default validateBody;
