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
  "/service",
  ...createGatewayProxy({
    target: process.env.ADMIN_SERVICE_URL,
    pathRewrite: { "^/service": "" },
  })
);

router.use(
  "/query",
  ...createGatewayProxy({
    target: `${process.env.ADMIN_SERVICE_URL}/query`,
  })
);

router.use(
  "/banner",
  ...createGatewayProxy({
    target: `${process.env.ADMIN_SERVICE_URL}/banner`,
  })
);

router.use(
  "/technician",
  ...createGatewayProxy({
    target: process.env.TECHNICIAN_SERVICE_URL,
    pathRewrite: { "^/technician": "" },
  })
);

router.use(
  "/customer",
  ...createGatewayProxy({
    target: process.env.CUSTOMER_SERVICE_URL,
    pathRewrite: { "^/customer": "" },
  })
);

router.use(
  "/booking",
  ...createGatewayProxy({
    target: process.env.CUSTOMER_SERVICE_URL,
    pathRewrite: { "^/booking": "" },
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
