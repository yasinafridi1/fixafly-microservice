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
async function uploadFileToS3(file) {
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

/**
 * Delete a file from S3
 * @param {string} fileUrl - Full public URL of the file
 * @returns {Promise<void>}
 */
export async function deleteFileFromS3(fileUrl) {
  if (!fileUrl) return;

  // Extract the Key from the URL
  // Example: https://bucket-name.s3.region.amazonaws.com/uploads/filename.jpg
  const urlParts = fileUrl.split(`/${s3Bucket}/`);
  if (urlParts.length < 2) return;

  const Key = urlParts[1]; // uploads/filename.jpg

  const params = {
    Bucket: s3Bucket,
    Key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (err) {
    console.error("Failed to delete file from S3:", err);
    throw new Error("Failed to delete file from S3");
  }
}

/**
 * Upload 2 files (file + idCard) to S3
 * @param {object} files - req.files from multer
 * @returns {Promise<{fileUrl: string, idCardUrl: string}>}
 */
export async function uploadFileAndIdCardToS3(files) {
  if (!files?.file?.[0] || !files?.idCard?.[0]) {
    throw new Error("Both file and idCard are required for upload");
  }

  const [fileUrl, idCardUrl] = await Promise.all([
    uploadFileToS3(files.file[0]),
    uploadFileToS3(files.idCard[0]),
  ]);

  return { fileUrl, idCardUrl };
}

export default uploadFileToS3;
