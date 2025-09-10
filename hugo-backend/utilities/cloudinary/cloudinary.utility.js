const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const path = require("path");
require("dotenv").config();

/**
 * @description Configure Cloudinary with credentials from environment variables
 * Keep credentials outside of code for security
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @description Multer in-memory storage (prevents temp file leaks on disk)
 */
const storage = multer.memoryStorage();

/**
 * @description Allowed image types only
 */
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

/**
 * @description File filter to allow only images
 */
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new Error("No file uploaded."), false);
  }

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "❌ Invalid file type. Only image (JPG, PNG, WEBP) files are allowed."
      ),
      false
    );
  }
};

/**
 * @description Multer middleware to handle file uploads securely
 * Limits file size to prevent DoS attacks
 */
exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([{ name: "profilePicture", maxCount: 1 }]);

/**
 * @description Middleware to check if files are uploaded
 */
exports.checkUploadedFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }
  next();
};

/**
 * @description Uploads an image buffer to Cloudinary with optional overwrite
 */
exports.uploadToCloudinary = async (file, type, existingPublicId = null) => {
  const baseFolder = "Hugo";
  let folder = baseFolder;

  switch (type) {
    case "profilePicture":
      folder += "/profilePictures";
      break;
    default:
      throw new Error("Invalid file type");
  }

  try {
    let public_id;

    if (existingPublicId) {
      public_id = existingPublicId;
    } else {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1e6);
      public_id = `${folder}/${timestamp}-${randomNum}`;
    }

    const fileBuffer = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(fileBuffer, {
      public_id: public_id,
      resource_type: "image",
      overwrite: true,
      invalidate: true,
    });

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error("❌ Error Uploading to Cloudinary:", error);
    throw new Error("Error uploading to Cloudinary");
  }
};

/**
 * @description Deletes an image from Cloudinary using its URL or public_id
 */
exports.deleteFromCloudinary = async (fileUrlOrId) => {
  try {
    let publicId = fileUrlOrId;

    if (fileUrlOrId.startsWith("http")) {
      const matches = fileUrlOrId.match(/\/image\/upload\/(?:v\d+\/)?([^?]+)/);
      if (!matches || matches.length < 2) {
        console.error(
          `❌ Failed to extract public ID from URL: ${fileUrlOrId}`
        );
        return;
      }
      publicId = matches[1].replace(/\.[^.]+$/, "");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok") {
      console.error(`❌ Cloudinary Deletion Failed for: ${publicId}`);
    } else {
      console.log(`✅ Successfully deleted: ${publicId}`);
    }
  } catch (error) {
    console.error("❌ Error Deleting from Cloudinary:", error);
    throw new Error("Cloudinary Deletion Failed");
  }
};
