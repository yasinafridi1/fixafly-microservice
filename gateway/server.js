import express from "express";
import envVariables from "./config/constants.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import ErrorMiddleware from "./middlewares/Error.js";

const { appPort } = envVariables;

const app = express();
app.set("trust proxy", 1);
const allowedUrls = ["http://localhost:5173", "https://admin.fixafly.com"];

const corsOption = {
  origin: allowedUrls,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOption));

// Basic rate limiter: max 100 requests per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use("/api/v1", router);
app.use(ErrorMiddleware);

app.listen(appPort, () => {
  console.log(`Gateway server running on port ${appPort}`);
});
