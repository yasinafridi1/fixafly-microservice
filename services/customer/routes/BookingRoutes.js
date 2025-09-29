import express from "express";
import auth from "../shared/middlewares/Auth.js";
import {
  checkoutSession,
  deleteBooking,
  getAllBookings,
  initializeBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { initialBookingSchema } from "../validations/index.js";
import validateBody from "../shared/middlewares/Validator.js";
import roleAuthorization from "../shared/middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.route("/checkout").post(auth, checkoutSession);

router
  .route("/")
  .get(auth, getAllBookings)
  .post([auth, validateBody(initialBookingSchema)], initializeBooking);

router
  .route("/:bookingId")
  .delete(
    [auth, roleAuthorization([USER_ROLES.admin, USER_ROLES.customer])],
    deleteBooking
  )
  .patch(
    [auth, roleAuthorization([USER_ROLES.admin, USER_ROLES.technician])],
    updateBookingStatus
  );

export default router;
