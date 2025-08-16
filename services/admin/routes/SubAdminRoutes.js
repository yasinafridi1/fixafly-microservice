import express from "express";
import validateBody from "../shared/middlewares/Validator.js";
import { controllerSchema, signinSchema } from "../validations/index.js";
import {
  addNewController,
  getAllControllers,
  getControllerById,
  login,
  softDeleteController,
  updateController,
} from "../controllers/subAdminController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllControllers)
  .post(validateBody(controllerSchema), addNewController);
router.route("/signin", validateBody(signinSchema), login);
router
  .route("/:id")
  .get(getControllerById)
  .patch(validateBody(controllerSchema), updateController)
  .delete(softDeleteController);

export default router;
