import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  dbUrl: process.env.DB_URL,
  appPort: process.env.PORT || 4004,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
};

export const USER_ROLES = {
  admin: "ADMIN",
  customer: "CUSTOMER",
  controller: "CONTROLLER",
  technician: "TECHNICIAN",
};

export const USER_STATUS = {
  active: "ACTIVE",
  blocked: "BLOCKED",
};

export default envVariables;
