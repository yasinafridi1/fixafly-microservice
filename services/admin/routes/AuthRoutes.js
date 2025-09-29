import express from "express";
import validateBody from "../shared/middlewares/Validator.js";
import {
  autoLogin,
  login,
  logoutAdmin,
  register,
} from "../controllers/authController.js";
import { refreshTokenSchema, signinSchema } from "../validations/index.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.post("/signin", validateBody(signinSchema), login);
router.post("/signup", register);
router.post("/refresh", validateBody(refreshTokenSchema), autoLogin);
router.post(
  "/logout",
  [auth, roleAuthorization([USER_ROLES.admin, USER_ROLES.controller])],
  logoutAdmin
);

export default router;
