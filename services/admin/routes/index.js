import express from "express";
import SuccessMessage from "../shared/utils/SuccessMessage.js";
import AuthRoutes from "./AuthRoutes.js";
import SubAdminRoutes from "./SubAdminRoutes.js";
import CategoryRoutes from "./CategoryRoutes.js";
import QueryRoutes from "./QueryRoutes.js";
import BannerRoutes from "./BannerRoutes.js";
const router = express.Router();

router.get("/health", (req, res) => {
  return SuccessMessage(res, "Admin server is up and running");
});

router.use("/auth", AuthRoutes);
router.use("/controller", SubAdminRoutes);
router.use("/query", QueryRoutes);
router.use("/banner", BannerRoutes);
router.use("/", CategoryRoutes);

export default router;
