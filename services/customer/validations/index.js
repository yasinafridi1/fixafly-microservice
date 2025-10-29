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

export const newCustomerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  role: Joi.string()
    .valid(USER_ROLES.company, USER_ROLES.customer) // only company or customer
    .required()
    .messages({
      "any.only": "Role must be either company or customer",
      "string.empty": "Role is required",
    }),
  phone: Joi.string()
    .pattern(/^\+?\d+$/) // optional + at start, then digits only
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must start with + (optional) and contain only digits",
      "string.empty": "Phone number is required",
    }),
  vatNumber: Joi.string().when("role", {
    is: USER_ROLES.company, // required if role is company
    then: Joi.required().messages({
      "any.required": "VAT Number is required for company",
    }),
    otherwise: Joi.forbidden(), // not allowed if role is customer
  }),
});

export const updateCustomerSchema = Joi.object({
  fullName: fullNameSchema,
  phone: Joi.string()
    .pattern(/^\+?\d+$/) // optional + at start, then digits only
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must start with + (optional) and contain only digits",
      "string.empty": "Phone number is required",
    }),
  vatNumber: Joi.string().when("role", {
    is: USER_ROLES.company, // required if role is company
    then: Joi.required().messages({
      "any.required": "VAT Number is required for company",
    }),
    otherwise: Joi.forbidden(), // not allowed if role is customer
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

export const initialBookingSchema = Joi.object({
  services: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({
          "string.base": "Service ID must be a string",
          "any.required": "Service ID is required",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .max(6)
    .required()
    .messages({
      "array.base": "Services must be an array",
      "array.min": "At least one service is required",
      "any.required": "Services are required",
      "array.max": "Max 6 services allowed",
    }),

  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),

  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // HH:mm format
    .required()
    .messages({
      "string.base": "Time must be a string",
      "string.pattern.base": "Time must be in HH:mm format",
      "any.required": "Time is required",
    }),

  comment: Joi.string().allow("", null).optional().messages({
    "string.base": "Comment must be a string",
  }),

  lat: Joi.number().required().messages({
    "number.base": "Latitude must be a number",
    "any.required": "Latitude is required",
  }),

  lng: Joi.number().required().messages({
    "number.base": "Longitude must be a number",
    "any.required": "Longitude is required",
  }),
});

export const sendOtpSchema = Joi.object({
  email: emailSchema, // or your own emailSchema
});

export const verifyOtpSchema = Joi.object({
  email: emailSchema, // or your own emailSchema
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 characters long",
    "string.empty": "OTP is required",
    "any.required": "OTP is required",
  }),
  hashedOtp: Joi.string().required().messages({
    "string.empty": "Hashed OTP is required",
    "any.required": "Hashed OTP is required",
  }),
});

export const updatePasswordSchema = Joi.object({
  password: passwordSchema,
  token: Joi.string().required().messages({
    "string.empty": "Token is required",
    "any.required": "Token is required",
  }),
});
