import express from "express";
import SuccessMessage from "../shared/utils/SuccessMessage.js";

const router = express.Router();

router.get("/health", (req, res) => {
  return SuccessMessage(res, "Admin server is up and running");
});

export default router;
