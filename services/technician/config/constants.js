import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  dbUrl: process.env.DB_URL,
  appPort: process.env.PORT || 4003,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsAccessSecret: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  s3Bucket: process.env.AWS_S3_BUCKET_NAME,
  customerServiceUrl: process.env.CUSTOMER_SERVICE_URL,
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
};

export const USER_STATUS = {
  pending: "PENDING",
  active: "ACTIVE",
  blocked: "BLOCKED",
};

export const USER_ROLES = {
  admin: "ADMIN",
  controller: "CONTROLLER",
  customer: "CUSTOMER",
  technician: "TECHNICIAN",
  company: "COMPANY",
};

export default envVariables;
