import express from "express";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import TechnicianRoutes from "./TechnicianRoutes.js";
const router = express.Router();

router.get("/health", (req, res) => {
  return SuccessMessage(res, "Technician server is up and running");
});

router.use("/technician", TechnicianRoutes);

export default router;
