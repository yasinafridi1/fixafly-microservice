import express from "express";
import validateBody, {
  fileValidator,
} from "../shared/middlewares/Validator.js";
import upload from "../shared/services/MulterService.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import { addEditServiceSchema } from "../validations/index.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(
    [upload.single("file"), fileValidator, validateBody(addEditServiceSchema)],
    addCategory
  );
router
  .route("/:id")
  .get(getCategoryById)
  .patch(
    [upload.single("file"), validateBody(addEditServiceSchema)],
    updateCategory
  )
  .delete(deleteCategory);

export default router;
