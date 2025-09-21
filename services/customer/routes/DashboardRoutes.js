import express from "express";
import {
  getTechnicianChartData,
  getTechnicianDashboardCard,
} from "../controllers/DashboardController.js";
import auth from "../shared/middlewares/Auth.js";
const router = express.Router();

router.route("/technician/:technicianId").get(getTechnicianDashboardCard);
router.route("/technician/chart/:technicianId").get(getTechnicianChartData);

export default router;
