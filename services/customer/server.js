import express from "express";
import routes from "./routes/index.js";
import ErrorMiddleware from "./shared/middlewares/Error.js";
import envVariables from "./config/constants.js";
import mongoose from "mongoose";
import stripeWebhook from "./webhooks/stripe.js";
const { appPort, dbUrl } = envVariables;

const app = express();

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

// ✅ Webhook must use raw body
app.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// ✅ Other requests (Gateway-protected)
app.use((req, res, next) => {
  if (
    req.headers["x-from-gateway"] !== "true" &&
    req.headers["X-From-Gateway"] !== "true"
  ) {
    return res.status(403).json({ message: "Access denied: Use gateway only" });
  }
  express.json()(req, res, next);
});

app.use("/", routes);
app.use(ErrorMiddleware);

app.listen(appPort, () => {
  console.log(`Customer is running on port ${appPort}`);
});
