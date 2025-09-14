import express from "express";
import auth from "../shared/middlewares/Auth.js";
import {
  checkoutSession,
  getAllBookings,
  initializeBooking,
} from "../controllers/bookingController.js";
import { initialBookingSchema } from "../validations/index.js";
import validateBody from "../shared/middlewares/Validator.js";

const router = express.Router();

router
  .route("/")
  .get(auth, getAllBookings)
  .post([auth, validateBody(initialBookingSchema)], initializeBooking);

router.route("/checkout").post(checkoutSession);

export default router;
