const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const uploadMediaFile = require("../../utilities/cloudinary/cloudinary.utility");
const mediaController = require("../../controllers/media-controller/media.controller");

/**
 * @description Route for uploading media files(Image/video).
 */
router.post(
  "/user/upload-media",
  authMiddleware,
  uploadMediaFile.upload,
  mediaController.uploadMedia
);

/**
 * @description Route to get all user media.
 */
router.get(
  "/user/get-all-user-media/:userId",
  authMiddleware,
  mediaController.getAllMedia
);

module.exports = router;
