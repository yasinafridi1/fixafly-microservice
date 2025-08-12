import express from "express";
import createGatewayProxy from "../utils/proxyGateway.js";

const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Gateway is up and running" });
});

router.use(
  "/admin",
  ...createGatewayProxy({
    target: process.env.ADMIN_SERVICE_URL,
    pathRewrite: { "^/admin": "" },
  })
);

router.use(
  "/auth",
  ...createGatewayProxy({
    target: process.env.AUTH_SERVICE_URL,
    pathRewrite: { "^/auth": "" },
  })
);

export default router;
