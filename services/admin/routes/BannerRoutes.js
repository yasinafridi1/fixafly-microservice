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
import { fileValidator } from "../shared/middlewares/Validator.js";
import upload from "../shared/services/MulterService.js";

const router = express.Router();

router
  .route("/")
  .get(getAllBanners)
  .post(
    [
      auth,
      roleAuthorization(USER_ROLES.admin),
      upload.single("file"),
      fileValidator,
    ],
    addBanner
  );

router
  .route("/:id")
  .patch(
    [auth, roleAuthorization([USER_ROLES.admin]), upload.single("file")],
    updateBanner
  )
  .delete([auth, roleAuthorization([USER_ROLES.admin])], deleteBanner);

export default router;
