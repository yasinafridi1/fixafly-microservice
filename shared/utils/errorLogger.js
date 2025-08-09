import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorLogStream = fs.createWriteStream(
  path.join(__dirname, "../error.log"),
  {
    flags: "a",
  }
);

// Custom error logging function
function logError(error) {
  const errorMessage = `[${new Date().toISOString()}] ${
    error.stack || error
  }\n`;
  errorLogStream.write(errorMessage);
}

export default logError;
