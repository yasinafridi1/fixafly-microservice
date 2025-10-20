import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  appPort: process.env.PORT || 4000,
  customerServiceUrl:
    process.env.CUSTOMER_SERVICE_URL || "http://localhost:4002",
  technicianServiceUrl:
    process.env.TECHNICIAN_SERVICE_URL || "http://localhost:4003",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:4004",
  adminServiceUrl: process.env.ADMIN_SERVICE_URL || "http://localhost:4001",
};

export default envVariables;
