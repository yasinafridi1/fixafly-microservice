import Joi from "joi";
import { USER_ROLES, USER_STATUS } from "../config/constants.js";

const emailSchema = Joi.string()
  .email({ tlds: { allow: true } }) // Disable strict TLD validation
  .required()
  .messages({
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  });

const fullNameSchema = Joi.string().required().max(70);

const passwordSchema = Joi.string()
  .pattern(
    new RegExp(
      '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,15}$'
    )
  )
  .required()
  .messages({
    "string.pattern.base":
      "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be 8-15 characters long",
  });

export const signinSchema = Joi.object({
  email: emailSchema, // or your own emailSchema
  password: Joi.string().required(),
  fcmToken: Joi.string().optional(),
});

export const technicianSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  role: Joi.string().valid(USER_ROLES.technician).required().messages({
    "any.only": "Invalid role",
    "string.empty": "Role is required",
  }),
  lat: Joi.number().min(-90).max(90).required().messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude cannot be less than -90",
    "number.max": "Latitude cannot be greater than 90",
    "any.required": "Latitude is required",
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude cannot be less than -180",
    "number.max": "Longitude cannot be greater than 180",
    "any.required": "Longitude is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?\d+$/) // optional + at start, then digits only
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must start with + (optional) and contain only digits",
      "string.empty": "Phone number is required",
    }),
});

export const updateTechnicianSchema = Joi.object({
  fullName: fullNameSchema,
  lat: Joi.number().min(-90).max(90).messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude cannot be less than -90",
    "number.max": "Latitude cannot be greater than 90",
  }),
  lng: Joi.number().min(-180).max(180).messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude cannot be less than -180",
    "number.max": "Longitude cannot be greater than 180",
  }),
  phone: Joi.string()
    .pattern(/^\+?\d+$/) // optional + at start, then digits only
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must start with + (optional) and contain only digits",
      "string.empty": "Phone number is required",
    }),
});

export const userStatusSchema = Joi.object({
  status: Joi.string()
    .valid(USER_STATUS.active, USER_STATUS.blocked)
    .required()
    .messages({
      "any.only": `Status must be ${USER_STATUS.active} or ${USER_STATUS.blocked}`,
      "string.empty": "Status is required",
    }),
});
