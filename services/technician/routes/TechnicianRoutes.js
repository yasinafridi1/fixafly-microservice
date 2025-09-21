import express from "express";
import validateBody, {
  fileAndIdCardValidator,
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
  getNearestTechnician,
  getDashboardCardData,
  getDashboardChartData,
} from "../controllers/technicianController.js";
import upload, {
  uploadFileAndIdCard,
} from "../shared/services/MulterService.js";
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.route("/signin").post(validateBody(signinSchema), login);
router
  .route("/dashboard/card")
  .get(
    [auth, roleAuthorization([USER_ROLES.technician])],
    getDashboardCardData
  );

router
  .route("/dashboard/chart")
  .get(
    [auth, roleAuthorization([USER_ROLES.technician])],
    getDashboardChartData
  );

router
  .route("/signup")
  .post(
    [
      uploadFileAndIdCard,
      fileAndIdCardValidator,
      validateBody(technicianSchema),
    ],
    newTechnician
  );

router.route("/nearest").get(getNearestTechnician);
router
  .route("/status/:id")
  .patch(
    [
      auth,
      roleAuthorization([USER_ROLES.admin]),
      validateBody(userStatusSchema),
    ],
    updateTechnicianStatus
  );

router
  .route("/")
  .get([auth, roleAuthorization([USER_ROLES.admin])], getAllTechnician);

router
  .route("/:id")
  .get(auth, getTechnicianById)
  .patch(
    [auth, upload.single("file"), validateBody(updateTechnicianSchema)],
    updateTechnician
  )
  .delete([auth, roleAuthorization([USER_ROLES.admin])], softDeleteTechnician);

export default router;
