import express from "express";
import {
  adminChartData,
  adminStats,
  getTechnicianChartData,
  getTechnicianDashboardCard,
} from "../controllers/DashboardController.js";
import auth from "../shared/middlewares/Auth.js";
import { USER_ROLES } from "../config/constants.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
const router = express.Router();

router.route("/technician/:technicianId").get(getTechnicianDashboardCard);
router.route("/technician/chart/:technicianId").get(getTechnicianChartData);
router.route("/admin/chart").get(auth, adminChartData);
router
  .route("/admin/card")
  .get([auth, roleAuthorization([USER_ROLES.admin])], adminStats);

export default router;
