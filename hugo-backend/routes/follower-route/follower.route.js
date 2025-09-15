const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const followerController = require("../../controllers/follower-controller/follower.controller");

/**
 * @description Follow a user
 */
router.post(
  "/follow-user/:targetUserId",
  authMiddleware,
  followerController.followUser
);

/**
 * @description Unfollow a user
 */
router.post(
  "/unfollow-user/:targetUserId",
  authMiddleware,
  followerController.unfollowUser
);

/**
 * @description Get user's followers
 */
router.get(
  "/get-user-followers/:userId",
  authMiddleware,
  followerController.getFollowers
);

/**
 * @description Get user's following list
 */
router.get(
  "/get-user-followings/:userId",
  authMiddleware,
  followerController.getFollowing
);

module.exports = router;
