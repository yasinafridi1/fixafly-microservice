import express from "express";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import CustomerRoutes from "./CustomerRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  return SuccessMessage(res, "Customer server is up and running");
});

router.use("/", CustomerRoutes);

export default router;
