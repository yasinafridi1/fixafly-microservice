import crypto from "crypto";
import AWS from "aws-sdk";
import envVariables from "../../config/constants.js";
const { awsAccessKey, awsAccessSecret, awsRegion, s3Bucket } = envVariables;

export function generateRandomFileName(originalName) {
  const ext = originalName.substring(originalName.lastIndexOf(".")); // keep extension
  const randomName = crypto.randomBytes(16).toString("hex"); // random 32-char hex
  return `${randomName}${ext}`;
}

const s3 = new AWS.S3({
  accessKeyId: awsAccessKey,
  secretAccessKey: awsAccessSecret,
  region: awsRegion,
});

/**
 * Upload file buffer to S3 and return the public URL
 * @param {object} file - file object from multer (req.file)
 * @returns {Promise<string>} - resolves to uploaded file URL
 */
export async function uploadFileToS3(file) {
  if (!file) throw new Error("No file provided");

  const fileName = generateRandomFileName(file.originalname);

  const params = {
    Bucket: s3Bucket,
    Key: `uploads/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const data = await s3.upload(params).promise();
  return data.Location; // public URL
}
