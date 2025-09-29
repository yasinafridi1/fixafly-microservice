import express from "express";
import {
  getAdminDashboardStats,
  getDashboardChartData,
} from "../controllers/adminController.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";
const router = express.Router();

router
  .route("/dashboard/stats")
  .get([auth, roleAuthorization([USER_ROLES.admin])], getAdminDashboardStats);
router
  .route("/dashboard/chart")
  .get([auth, roleAuthorization([USER_ROLES.admin])], getDashboardChartData);

export default router;
