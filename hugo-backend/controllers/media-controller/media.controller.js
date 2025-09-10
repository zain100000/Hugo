const Media = require("../../models/media-model/media.model");
const User = require("../../models/user-model/user.model");
const {
  uploadToCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");

/**
 * @description Upload media files (images and videos) to Cloudinary and save references to database
 * @route POST /api/media/user/upload-media
 * @access Private (Authenticated Users)
 */
exports.uploadMedia = async (req, res) => {
  try {
    const userId = req.userId;
    const mediaData = [];

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "ACTIVE") {
      let message = "";

      if (user.status === "SUSPENDED") {
        message = "Your account is suspended. You cannot upload media.";
      } else if (user.status === "BANNED") {
        message = "Your account is banned. You cannot upload media.";
      } else {
        message = "Your account is not active. You cannot upload media.";
      }

      return res.status(403).json({
        success: false,
        message: message,
        status: user.status,
      });
    }

    if (req.files.mediaImage) {
      for (const file of req.files.mediaImage) {
        const result = await uploadToCloudinary(file, "mediaImage", userId);
        mediaData.push({
          user: userId,
          type: "IMAGE",
          url: result.url,
        });
      }
    }

    if (req.files.mediaVideo) {
      for (const file of req.files.mediaVideo) {
        const result = await uploadToCloudinary(file, "mediaVideo", userId);
        mediaData.push({
          user: userId,
          type: "VIDEO",
          url: result.url,
        });
      }
    }

    const savedMedia = await Media.insertMany(mediaData);

    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          media: {
            $each: savedMedia.map((item) => ({
              user: item.user,
              type: item.type,
              url: item.url,
              uploadedAt: item.uploadedAt,
            })),
          },
        },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      media: savedMedia,
    });
  } catch (error) {
    console.error("Media Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload and save media",
    });
  }
};

/**
 * @description Get all media for the authenticated user
 * @route GET /api/media/user/get-all-media/:userId
 * @access Private (Authenticated Users)
 */
exports.getAllMedia = async (req, res) => {
  try {
    const { userId } = req.params;

    const userMedia = await Media.find({ user: userId })
      .sort({ uploadedAt: -1 })
      .populate("user", "userName profilePicture");

    if (!userMedia || userMedia.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No media found for this user",
        media: [],
        totalCount: 0,
      });
    }

    res.status(200).json({
      success: true,
      message: "Media retrieved successfully",
      media: userMedia,
      totalCount: userMedia.length,
    });
  } catch (error) {
    console.error("Get All Media Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve media",
    });
  }
};
