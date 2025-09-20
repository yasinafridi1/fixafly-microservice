import express from "express";
import {
  addQuery,
  deleteQuery,
  getAllQueries,
  getQueryDetail,
  markResolved,
} from "../controllers/queryController.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";
import validateBody from "../shared/middlewares/Validator.js";
import upload from "../shared/services/MulterService.js";
import { querySchema } from "../validations/index.js";

const router = express.Router();

router
  .route("/")
  .get([auth], getAllQueries)
  .post([auth, upload.single("file"), validateBody(querySchema)], addQuery);

router
  .route("/:id")
  .get([auth], getQueryDetail)
  .patch([auth, roleAuthorization([USER_ROLES.admin])], markResolved)
  .delete([auth, roleAuthorization([USER_ROLES.admin])], deleteQuery);

export default router;
