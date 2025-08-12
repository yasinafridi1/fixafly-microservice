import express from "express";
import SuccessMessage from "../utils/SuccessMessage.js";
import AuthRoutes from "./AuthRoutes.js";
const router = express.Router();

router.get("/health", (req, res) => {
  return SuccessMessage(res, "Auth server is up and running");
});

router.use("/auth", AuthRoutes);

export default router;
