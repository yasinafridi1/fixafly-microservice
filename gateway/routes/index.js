import express from "express";
import createGatewayProxy from "../utils/proxyGateway.js";
import envVariables from "../config/constants.js";
const {
  customerServiceUrl,
  technicianServiceUrl,
  authServiceUrl,
  adminServiceUrl,
} = envVariables;

const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ message: "Gateway is up and running" });
});

router.use(
  "/admin",
  ...createGatewayProxy({
    target: adminServiceUrl,
    pathRewrite: { "^/admin": "" },
  })
);

router.use(
  "/service",
  ...createGatewayProxy({
    target: `${adminServiceUrl}/service`,
  })
);

router.use(
  "/query",
  ...createGatewayProxy({
    target: `${adminServiceUrl}/query`,
  })
);

router.use(
  "/banner",
  ...createGatewayProxy({
    target: `${adminServiceUrl}/banner`,
  })
);

router.use(
  "/technician",
  ...createGatewayProxy({
    target: technicianServiceUrl,
    pathRewrite: { "^/technician": "" },
  })
);

router.use(
  "/customer",
  ...createGatewayProxy({
    target: customerServiceUrl,
    pathRewrite: { "^/customer": "" },
  })
);

router.use(
  "/booking",
  ...createGatewayProxy({
    target: customerServiceUrl,
    pathRewrite: { "^/booking": "" },
  })
);

router.use(
  "/auth",
  ...createGatewayProxy({
    target: authServiceUrl,
    pathRewrite: { "^/auth": "" },
  })
);

export default router;
