import express from "express";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import CustomerRoutes from "./CustomerRoutes.js";
import BookingRoutes from "./BookingRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  return SuccessMessage(res, "Customer server is up and running");
});

router.use("/", BookingRoutes);
router.use("/auth", CustomerRoutes);

export default router;
