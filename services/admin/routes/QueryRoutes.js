import express from "express";
import {
  addQuery,
  deleteQuery,
  getQueryDetail,
  markResolved,
} from "../controllers/queryController.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.route("/").post([auth], addQuery);

router
  .route("/:id")
  .get([auth], getQueryDetail)
  .patch([auth, roleAuthorization(USER_ROLES.admin)], markResolved)
  .delete([auth, roleAuthorization(USER_ROLES.admin)], deleteQuery);

export default router;
