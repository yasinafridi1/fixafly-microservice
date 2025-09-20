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
import auth from "../shared/middlewares/Auth.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.route("/signin").post(validateBody(signinSchema), login);
router
  .route("/signup")
  .post(
    [upload.single("file"), fileValidator, validateBody(newCustomerSchema)],
    newCustomer
  );
router
  .route("/status/:id")
  .patch(
    [
      auth,
      roleAuthorization([USER_ROLES.admin]),
      validateBody(userStatusSchema),
    ],
    updateUserStatus
  );

router
  .route("/")
  .get([auth, roleAuthorization([USER_ROLES.admin])], getAllUser);

router
  .route("/:id")
  .get(auth, getUserById)
  .patch(
    [auth, upload.single("file"), validateBody(updateCustomerSchema)],
    updateCustomer
  )
  .delete([auth, roleAuthorization([USER_ROLES.admin])], softDeleteCustomer);

export default router;
