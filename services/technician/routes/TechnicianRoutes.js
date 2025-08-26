import express from "express";
import validateBody, {
  fileValidator,
} from "../shared/middlewares/Validator.js";
import {
  signinSchema,
  technicianSchema,
  updateTechnicianSchema,
  userStatusSchema,
} from "../validations/index.js";
import {
  newTechnician,
  getAllTechnician,
  getTechnicianById,
  softDeleteTechnician,
  updateTechnician,
  updateTechnicianStatus,
  login,
} from "../controllers/technicianController.js";
import upload from "../shared/services/MulterService.js";

const router = express.Router();

router.route("/signin").post(validateBody(signinSchema), login);
router
  .route("/status/:id")
  .patch(validateBody(userStatusSchema), updateTechnicianStatus);
router
  .route("/")
  .get(getAllTechnician)
  .post(
    [upload.single("file"), fileValidator, validateBody(technicianSchema)],
    newTechnician
  );
router
  .route("/:id")
  .get(getTechnicianById)
  .patch(
    [upload.single("file"), validateBody(updateTechnicianSchema)],
    updateTechnician
  )
  .delete(softDeleteTechnician);

export default router;
