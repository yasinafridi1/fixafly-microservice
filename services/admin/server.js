import express from "express";
import routes from "./routes/index.js";
import ErrorMiddleware from "./shared/middlewares/Error.js";
import envVariables from "./config/constants.js";
const { appPort, dbUrl } = envVariables;

const app = express();

app.use(express.json());
app.use(ErrorMiddleware);

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", routes);

app.listen(appPort, () => {
  dbConnec;
  console.log(`Server is running on port ${appPort}`);
});
