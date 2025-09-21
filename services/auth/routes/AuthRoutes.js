import express from "express";
import validateBody from "../middlewares/Validator.js";
import { login, register } from "../controllers/authController.js";
import {
  signinSchema,
  signupSchema,
  updatePasswordSchema,
} from "../validations/index.js";

const router = express.Router();

router.post("/signin", validateBody(signinSchema), login);
router.post("/signup", validateBody(signupSchema), register);
router.patch(
  "/long/secret/path/update/password",
  validateBody(updatePasswordSchema),
  updatePassword
);

export default router;
