import Joi from "joi";

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

export const signupSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  role: Joi.string().required(),
  fullName: fullNameSchema,
});
