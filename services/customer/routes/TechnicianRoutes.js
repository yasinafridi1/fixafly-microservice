import express from "express";
import validateBody from "../shared/middlewares/Validator.js";
import {
  signinSchema,
  technicianSchema,
  updateTechinicianSchema,
} from "../validations/index.js";
import {
  newTechnician,
  getAllTechnician,
  getTechnicianById,
  softDeleteTechnician,
  updateTechnician,
} from "../controllers/technicianController.js";
const router = express.Router();

router
  .route("/")
  .get(getAllTechnician)
  .post(validateBody(technicianSchema), newTechnician);
router.route("/signin", validateBody(signinSchema), login);
router
  .route("/:id")
  .get(getTechnicianById)
  .patch(validateBody(updateTechinicianSchema), updateTechnician)
  .delete(softDeleteTechnician);

export default router;
