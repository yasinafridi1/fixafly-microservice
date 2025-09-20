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
});

export const controllerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  role: Joi.string().valid(USER_ROLES.controller).required().messages({
    "any.only": "Role must be CONTROLLER",
    "string.empty": "Role is required",
  }),

  // ✅ Status can be ACTIVE or BLOCKED
  status: Joi.string()
    .valid(USER_STATUS.active, USER_STATUS.blocked)
    .required()
    .messages({
      "any.only": `Status must be ${USER_STATUS.active} or ${USER_STATUS.blocked}`,
      "string.empty": "Status is required",
    }),
});

export const addEditServiceSchema = Joi.object({
  name: fullNameSchema,
  description: Joi.string().required().max(1500).messages({
    "string.empty": "Description is required",
    "string.max": "Description must not exceed 1500 characters",
  }),
  price: Joi.number().required().min(0).messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be at least 0",
    "any.required": "Price is required",
  }),
});

export const querySchema = Joi.object({
  subject: Joi.string().required().max(255).messages({
    "string.empty": "Subject is required",
    "string.max": "Subject must not exceed 255 characters",
  }),
  comment: Joi.string().required().max(1000).messages({
    "string.empty": "Comment is required",
    "string.max": "Comment must not exceed 1000 characters",
  }),
});
