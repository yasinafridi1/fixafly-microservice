import express from "express";
import validateBody from "../middlewares/Validator.js";
import {
  login,
  logout,
  refreshSession,
  register,
  updatePassword,
} from "../controllers/authController.js";
import {
  signinSchema,
  signupSchema,
  updatePasswordSchema,
} from "../validations/index.js";

const router = express.Router();

router.post("/signin", validateBody(signinSchema), login);
router.post("/signup", validateBody(signupSchema), register);
router.post("/refresh_session", refreshSession);
router.patch(
  "/long/secret/path/update/password",
  validateBody(updatePasswordSchema),
  updatePassword
);

router.get("/logout/:id", logout);

export default router;
