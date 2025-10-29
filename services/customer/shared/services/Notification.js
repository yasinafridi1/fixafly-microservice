import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON file manually
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../firebase-service.json"), "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendNotification = async (message) => {
  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const buildNotificationMessage = (token, title, body, data = {}) => {
  return {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    token: token,
  };
};

export const sendNotificationsToMultiple = async (
  tokens,
  title,
  body,
  data = {}
) => {
  for (const token of tokens) {
    if (!token) continue; // skip invalid tokens
    const message = buildNotificationMessage(token, title, body, data);
    await sendNotification(message);
  }
};
