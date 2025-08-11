import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  dbUrl: process.env.DB_URL,
  appPort: process.env.PORT || 4001,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsAccessSecret: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  s3Bucket: process.env.AWS_S3_BUCKET_NAME,
};

export default envVariables;
