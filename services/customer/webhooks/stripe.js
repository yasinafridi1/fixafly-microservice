import Stripe from "stripe";
import envVariables, {
  NOTIFICATION_TOPICS,
  notificationMessages,
  PAYMENT_STATUS,
} from "../config/constants.js";
import BookingModel from "../models/BookingModel.js";
import PaymentModel from "../models/PaymentModel.js";
import axiosInstance from "../shared/utils/AxiosInstance.js";
import { locationObjDesctructure } from "../helpers/location.js";
import { sendNotificationsToMultiple } from "../shared/services/Notification.js";
const { stripeSecretKey, stripeWebhookKey, technicianServiceUrl } =
  envVariables;

const stripe = new Stripe(stripeSecretKey);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      stripeWebhookKey
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Listen for checkout completed
  if (event.type === "checkout.session.completed") {
    setImmediate(async () => {
      try {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        // create payment record
        const newPayment = new PaymentModel({
          id: session.id,
          payment_intent: session.payment_intent,
          customer_details: session.customer_details,
          amount_total: Math.floor(session.amount_total / 100),
          bookingId: orderId,
          currency: session.currency,
        });
        const result = await newPayment.save({ validateBeforeSave: false });
        // update booking payment status
        const updated = await BookingModel.findByIdAndUpdate(orderId, {
          paymentStatus: PAYMENT_STATUS.paid,
          paymentRef: result._id,
        });

        const { lat, lng } = locationObjDesctructure(updated.location);

        let technicians = [];
        try {
          const response = await axiosInstance.get(
            `${technicianServiceUrl}/nearest?lng=${lng}&lat=${lat}&limit=${5}`
          );
          if (!response?.data?.data?.length) {
            return next(new ErrorHandler("No technician found for now", 404));
          }
          technicians = response?.data?.data;
        } catch (error) {
          error.statusCode = error.response?.status || 500;
          error.message =
            error?.response?.data?.message ||
            error?.message ||
            "Internal Server Error";
          console.log("Error fetching technicians===>", error);
        }

        let fcmTokens = [];

        const ids = technicians?.map((tech) => {
          // send notifications to nearest technicians
          const { fcmToken } = tech;
          if (fcmToken) fcmTokens.push(fcmToken);
          return tech._id;
        });
        BookingModel.updateOne(
          { _id: orderId },
          { nearestTechnicians: ids }
        ).exec();
        const { title, body } = notificationMessages(
          NOTIFICATION_TOPICS.newOrderTechnician
        );

        await sendNotificationsToMultiple(fcmTokens, title, body);
      } catch (err) {
        console.log("Error in webhook processing===>", err);
      }
    });
  }

  res.json({ received: true });
};

export default stripeWebhook;
