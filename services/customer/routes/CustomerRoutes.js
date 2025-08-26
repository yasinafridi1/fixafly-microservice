import express from "express";
import validateBody, {
  fileValidator,
} from "../shared/middlewares/Validator.js";
import {
  newCustomerSchema,
  signinSchema,
  updateCustomerSchema,
  userStatusSchema,
} from "../validations/index.js";

import {
  getAllUser,
  getUserById,
  login,
  newCustomer,
  softDeleteCustomer,
  updateCustomer,
  updateUserStatus,
} from "../controllers/customerController.js";
import upload from "../shared/services/MulterService.js";

const router = express.Router();

router.route("/signin").post(validateBody(signinSchema), login);
router
  .route("/status/:id")
  .patch(
    [upload.single("file"), fileValidator, validateBody(userStatusSchema)],
    updateUserStatus
  );
router
  .route("/")
  .get(getAllUser)
  .post(validateBody(newCustomerSchema), newCustomer);

router
  .route("/:id")
  .get(getUserById)
  .patch(
    upload.single("file"),
    validateBody(updateCustomerSchema),
    updateCustomer
  )
  .delete(softDeleteCustomer);

export default router;
