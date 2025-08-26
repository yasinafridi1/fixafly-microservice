import express from "express";
import validateBody from "../shared/middlewares/Validator.js";
import {
  newCustomerSchema,
  updateCustomerSchema,
  userStatusSchema,
} from "../validations/index.js";

import {
  getAllUser,
  getUserById,
  newCustomer,
  softDeleteCustomer,
  updateCustomer,
  updateUserStatus,
} from "../controllers/customerController.js";
const router = express.Router();

router
  .route("/status/:id")
  .patch(validateBody(userStatusSchema), updateUserStatus);
router
  .route("/")
  .get(getAllUser)
  .post(validateBody(newCustomerSchema), newCustomer);

router
  .route("/:id")
  .get(getUserById)
  .patch(validateBody(updateCustomerSchema), updateCustomer)
  .delete(softDeleteCustomer);

export default router;
