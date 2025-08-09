import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  dbUrl: process.env.DB_URL,
  appPort: process.env.PORT || 4001,
};

export default envVariables;
