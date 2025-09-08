import express from "express";
import validateBody, {
  fileValidator,
} from "../shared/middlewares/Validator.js";
import upload from "../shared/services/MulterService.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoriesByIds,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { addEditServiceSchema } from "../validations/index.js";
import { USER_ROLES } from "../config/constants.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";

const router = express.Router();

router.route("/list").post(getCategoriesByIds);

router
  .route("/")
  .get(getAllCategories)
  .post(
    [
      auth,
      roleAuthorization([USER_ROLES.admin, USER_ROLES.controller]),
      upload.single("file"),
      fileValidator,
      validateBody(addEditServiceSchema),
    ],
    addCategory
  );

router
  .route("/:id")
  .get(auth, getCategoryById)
  .patch(
    [
      auth,
      roleAuthorization([USER_ROLES.admin, USER_ROLES.controller]),
      upload.single("file"),
      validateBody(addEditServiceSchema),
    ],
    updateCategory
  )
  .delete([auth, roleAuthorization([USER_ROLES.admin])], deleteCategory);

export default router;
