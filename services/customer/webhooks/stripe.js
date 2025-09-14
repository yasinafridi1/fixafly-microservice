import Stripe from "stripe";
import envVariables from "../config/constants.js";
const { stripeSecretKey, stripeWebhookKey } = envVariables;

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
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    console.log("✅ Payment completed for orderId:", orderId);

    // if (orderId) {
    //   try {
    //     await OrderModel.findByIdAndUpdate(orderId, { paymentStatus: "paid" });
    //     console.log("✅ Order marked as paid:", orderId);
    //   } catch (err) {
    //     console.error("DB update failed:", err.message);
    //   }
    // }
  }

  res.json({ received: true });
};

export default stripeWebhook;
