import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Gateway is up and running" });
});

router.use(
  "/admin",
  createProxyMiddleware({
    target: process.env.ADMIN_SERVICE_URL || "http://localhost:4001",
    changeOrigin: true,
    pathRewrite: { "^/admin": "" },
  })
);

router.use(
  "/customer",
  createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL || "http://localhost:4002",
    changeOrigin: true,
    pathRewrite: { "^/customer": "" },
  })
);

export default router;
