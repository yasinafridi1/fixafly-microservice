import express from "express";
import validateBody from "../shared/middlewares/Validator.js";
import { login, register } from "../controllers/authController.js";
import { signinSchema, signupSchema } from "../validations/index.js";

const router = express.Router();

router.post("/signin", validateBody(signinSchema), login);
router.post("/signup", validateBody(signupSchema), register);

export default router;
