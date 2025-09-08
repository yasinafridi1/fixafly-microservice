import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import router from "./routes/index.js";
import ErrorMiddleware from "./middlewares/Error.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
app.set("trust proxy", 1);
const allowedUrls = ["http://localhost:5173", "http://www.localhost:5173"];

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

app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
});
