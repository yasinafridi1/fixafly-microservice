import Joi from "joi";
import { USER_ROLES, USER_STATUS } from "../config/constants";

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
    .pattern(/^\d+$/) // only digits
    .required()
    .messages({
      "string.pattern.base": "Phone number must contain only digits",
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
    .pattern(/^\d+$/) // only digits
    .required()
    .messages({
      "string.pattern.base": "Phone number must contain only digits",
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
