const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const coinPackageController = require("../../controllers/coin-package-controller/coin.package.controller");

/**
 * @description Route for creating coin packages.
 */
router.post(
  "/super-admin/create-package",
  authMiddleware,
  coinPackageController.createCoinPackage
);

/**
 * @description Route to get all packages.
 */
router.get(
  "/super-admin/get-all-packages",
  authMiddleware,
  coinPackageController.getAllCoinPackages
);

/**
 * @description Route to update packages.
 */
router.patch(
  "/super-admin/update-package/:packageId",
  authMiddleware,
  coinPackageController.updateCoinPackage
);

/**
 * @description Route to delete packages.
 */
router.delete(
  "/super-admin/delete-package/:packageId",
  authMiddleware,
  coinPackageController.deleteCoinPackage
);

module.exports = router;
