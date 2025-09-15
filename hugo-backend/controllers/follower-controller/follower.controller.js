const User = require("../../models/user-model/user.model");

/**
 * @description Follow a user
 * @route POST /api/follow/follow-user/:targetUserId
 * @access Private (Authenticated Users)
 */
exports.followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.targetUserId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    if (
      currentUser.blockedUsers.includes(targetUserId) ||
      targetUser.blockedUsers.includes(currentUserId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot follow this user due to blocking restrictions",
      });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    });

    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.userName}`,
    });
  } catch (error) {
    console.error("❌ Error following user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Unfollow a user
 * @route POST /api/follow/unfollow-user/:targetUserId
 * @access Private (Authenticated Users)
 */
exports.unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.targetUserId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUser.userName}`,
    });
  } catch (error) {
    console.error("❌ Error unfollowing user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Get user's followers list
 * @route GET /api/follow/get-all-followers/:userId
 * @access Private (Authenticated Users)
 */
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate({
        path: "followers",
        select: "userName profilePicture bio",
      })
      .select("followers");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const totalFollowers = await User.findById(userId).select("followers");
    const totalCount = totalFollowers.followers.length;

    res.status(200).json({
      success: true,
      message: "Followers fetched successfully",
      followers: user.followers,
      count: totalCount,
    });
  } catch (error) {
    console.error("❌ Error fetching followers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Get users that a user is following
 * @route GET /api/follow/get-all-followings/:userId
 * @access Private (Authenticated Users)
 */
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate({
        path: "following",
        select: "userName profilePicture bio",
      })
      .select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const totalFollowing = await User.findById(userId).select("following");
    const totalCount = totalFollowing.following.length;

    res.status(200).json({
      success: true,
      message: "Following fetched successfully",
      following: user.following,
      count: totalCount,
    });
  } catch (error) {
    console.error("❌ Error fetching following:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
