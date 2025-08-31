import multer from "multer";

// Use memory storage so file is available in req.file.buffer for S3 upload
const storage = multer.memoryStorage();

// File filter to allow only image files
function imageFileFilter(req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // limit file size to 10MB
  },
});

export const uploadFileAndIdCard = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "idCard", maxCount: 1 },
]);

export default upload;
