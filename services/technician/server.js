import express from "express";
import routes from "./routes/index.js";
import ErrorMiddleware from "./shared/middlewares/Error.js";
import envVariables from "./config/constants.js";
import mongoose from "mongoose";
const { appPort, dbUrl } = envVariables;

const app = express();

app.use(express.json());

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use((req, res, next) => {
  if (
    req.headers["x-from-gateway"] !== "true" &&
    req.headers["X-From-Gateway"] !== "true"
  ) {
    return res.status(403).json({ message: "Access denied: Use gateway only" });
  }
  next();
});

app.use("/", routes);
app.use(ErrorMiddleware);

app.listen(appPort, () => {
  console.log(`Technician is running on port ${appPort}`);
});
