const CoinPackage = require("../../models/coin-package-model/coin.package.model");

/**
 * @desc Create a new coin package
 * @route POST /api/coin-package/super-admin/create-package
 * @access Super Admin
 */
exports.createCoinPackage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create package",
      });
    }

    const { name, coins, price, currency, duration } = req.body;

    if (!duration || !duration.value || !duration.unit) {
      return res.status(400).json({
        success: false,
        message: "Duration (value & unit) is required",
      });
    }

    const exists = await CoinPackage.findOne({ name });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Coin package already exists" });
    }

    const newPackage = new CoinPackage({
      name,
      coins,
      price,
      currency,
      duration,
    });

    await newPackage.save();

    res.status(201).json({
      success: true,
      message: "Coin package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error("❌ Error creating coin package:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Get all coin packages
 * @route GET /api/coin-package/super-admin/get-all-packages
 * @access Public
 */
exports.getAllCoinPackages = async (req, res) => {
  try {
    const packages = await CoinPackage.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({
        success: true,
        message: "Packages fetched successfully!",
        packages,
      });
  } catch (error) {
    console.error("❌ Error fetching coin packages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Update a coin package
 * @route PATCH /api/coin-package/super-admin/update-package/:packageId
 * @access Super Admin
 */
exports.updateCoinPackage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can update package",
      });
    }

    const { packageId } = req.params;
    const updates = req.body;

    const updatedPackage = await CoinPackage.findByIdAndUpdate(
      packageId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Coin package not found" });
    }

    res.status(201).json({
      success: true,
      message: "Coin package updated successfully",
      updatedPackage,
    });
  } catch (error) {
    console.error("❌ Error updating coin package:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc Delete a coin package
 * @route DELETE /api/coin-package/super-admin/delete-package/:packageId
 * @access Super Admin
 */
exports.deleteCoinPackage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can delete package",
      });
    }

    const { packageId } = req.params;

    const deleted = await CoinPackage.findByIdAndDelete(packageId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Coin package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Coin package deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting coin package:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
