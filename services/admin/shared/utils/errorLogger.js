import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../../");
const logFile = path.join(logDir, "error.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorLogStream = fs.createWriteStream(logFile, { flags: "a" });

// Custom error logging function
function logError(error) {
  const errorMessage = `[${new Date().toLocaleString("en-US", {
    timeZone: "Asia/Riyadh",
  })}] ${error.stack || error}\n`;
  errorLogStream.write(errorMessage);
}

export default logError;
