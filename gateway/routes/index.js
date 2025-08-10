import express from "express";
import createGatewayProxy from "../utils/proxyGateway.js";

const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Gateway is up and running" });
});

router.use(
  "/admin",
  ...createGatewayProxy({
    target: process.env.ADMIN_SERVICE_URL || "http://admin:4001",
    pathRewrite: { "^/admin": "" },
  })
);

export default router;
