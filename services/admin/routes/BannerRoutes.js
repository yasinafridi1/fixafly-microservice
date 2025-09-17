import express from "express";
import {
  addBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "../controllers/bannerController.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router
  .route("/")
  .get(getAllBanners)
  .post([auth, roleAuthorization(USER_ROLES.admin)], addBanner);

router
  .route("/:id")
  .patch([auth, roleAuthorization(USER_ROLES.admin)], updateBanner)
  .delete([auth, roleAuthorization(USER_ROLES.admin)], deleteBanner);

export default router;
