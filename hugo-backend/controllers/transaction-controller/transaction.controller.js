const crypto = require("crypto");
const CoinPackage = require("../../models/coin-package-model/coin.package.model");
const Transaction = require("../../models/transaction-model/transaction.model");
const User = require("../../models/user-model/user.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");

/**
 * @description Get user coin balance
 * @route GET /api/transaction/user/balance
 * @access Private (Authenticated Users)
 */
exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("coins userName email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Balance fetched successfully",
      balance: user.coins || 0,
      user: {
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("getUserBalance:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Get user transaction history
 * @route GET /api/transaction/user/transactions
 * @access Private (Authenticated Users)
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ userId })
      .populate("packageId", "name coins price currency")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      transactions,
      total: transactions.length,
    });
  } catch (err) {
    console.error("getUserTransactions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Initiate purchase: create a PENDING transaction with receipt
 * @route POST /api/transaction/user/buy-package/:packageId
 * @access Private (Authenticated Users)
 */
exports.buyCoinPackage = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { packageId } = req.params;
    const { transactionId, paymentMethod = "MANUAL" } = req.body;

    const pkg = await CoinPackage.findById(packageId);

    if (!pkg || !pkg.isActive) {
      return res.status(404).json({
        success: false,
        message: "Package not available",
      });
    }

    // Check if receipt file is uploaded
    if (!req.files?.receipt) {
      return res.status(400).json({
        success: false,
        message: "Payment receipt screenshot is required",
      });
    }

    // Upload receipt to Cloudinary - FIXED: use correct type name
    const uploadResult = await uploadToCloudinary(
      req.files.receipt[0],
      "paymentReceipts" // CHANGED: Correct spelling
    );

    const transaction = await Transaction.create({
      userId,
      packageId,
      amount: pkg.price,
      coins: pkg.coins,
      status: "PENDING_REVIEW",
      paymentMethod: "PAYONEER_MANUAL",
      reference:
        transactionId || `MANUAL_${crypto.randomBytes(8).toString("hex")}`,
      receiptUrl: uploadResult.url,
      receiptPublicId: uploadResult.public_id,
      reviewedBy: null,
      reviewedAt: null,
      adminNotes: null,
    });

    res.status(201).json({
      success: true,
      message: "Payment submitted for review. Please wait for admin approval.",
      transaction: {
        id: transaction._id,
        coins: transaction.coins,
        amount: transaction.amount,
        status: transaction.status,
        receiptUrl: transaction.receiptUrl,
        reference: transaction.reference,
        package: {
          name: pkg.name,
          coins: pkg.coins,
          price: pkg.price,
          currency: pkg.currency,
        },
      },
    });
  } catch (err) {
    console.error("buyCoinPackage:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Get all pending transactions for superadmin review
 * @route GET /api/transaction/super-admin/pending-transactions
 * @access Private (SuperAdmin only)
 */
exports.getPendingTransactions = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin only.",
      });
    }

    const transactions = await Transaction.find({
      status: "PENDING_REVIEW",
    })
      .populate("userId", "userName email profilePicture")
      .populate("packageId", "name coins price currency")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Pending transactions fetched successfully",
      transactions,
      total: transactions.length,
    });
  } catch (err) {
    console.error("getPendingTransactions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Approve transaction and add coins to user
 * @route PATCH /api/transaction/super-admin/approve-transaction/:transactionId
 * @access Private (SuperAdmin only)
 */
exports.approveTransaction = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin only.",
      });
    }

    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate("userId")
      .populate("packageId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "PENDING_REVIEW") {
      return res.status(400).json({
        success: false,
        message: "Transaction is not pending review",
      });
    }

    // Update transaction status
    transaction.status = "SUCCESS";
    transaction.reviewedBy = req.user.id;
    transaction.reviewedAt = new Date();
    transaction.adminNotes = adminNotes || "Payment verified and approved";
    await transaction.save();

    // Add coins to user
    const user = transaction.userId;
    const oldBalance = user.coins || 0;
    user.coins = oldBalance + transaction.coins;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Transaction approved successfully",
      transaction: {
        id: transaction._id,
        status: transaction.status,
        coins: transaction.coins,
        amount: transaction.amount,
        packageName: transaction.packageId.name,
      },
      user: {
        oldBalance,
        newBalance: user.coins,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("approveTransaction:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Reject transaction
 * @route PATCH /api/transaction/super-admin/reject-transaction/:transactionId
 * @access Private (SuperAdmin only)
 */
exports.rejectTransaction = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin only.",
      });
    }

    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate("userId")
      .populate("packageId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "PENDING_REVIEW") {
      return res.status(400).json({
        success: false,
        message: "Transaction is not pending review",
      });
    }

    // Update transaction status to rejected
    transaction.status = "REJECTED";
    transaction.reviewedBy = req.user.id;
    transaction.reviewedAt = new Date();
    transaction.adminNotes = adminNotes;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction rejected successfully",
      transaction: {
        id: transaction._id,
        status: transaction.status,
        coins: transaction.coins,
        amount: transaction.amount,
        packageName: transaction.packageId.name,
        adminNotes: transaction.adminNotes,
      },
    });
  } catch (err) {
    console.error("rejectTransaction:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Get transaction details by ID
 * @route GET /api/transaction/user/transaction/:transactionId
 * @access Private (Authenticated Users)
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId,
    })
      .populate("packageId", "name coins price currency")
      .populate("reviewedBy", "userName");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      transaction,
    });
  } catch (err) {
    console.error("getTransactionById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Get all transactions (Admin view)
 * @route GET /api/transaction/super-admin/all-transactions
 * @access Private (SuperAdmin only)
 */
exports.getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin only.",
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate("userId", "userName email profilePicture")
      .populate("packageId", "name coins price currency")
      .populate("reviewedBy", "userName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "All transactions fetched successfully",
      transactions,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getAllTransactions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Delete a transaction (SuperAdmin only)
 * Deletes associated receipt from Cloudinary as well.
 * @route DELETE /api/transaction/super-admin/delete-transaction/:transactionId
 * @access Private (SuperAdmin only)
 */
exports.deleteTransaction = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin only.",
      });
    }

    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Delete receipt from Cloudinary if exists
    if (transaction.receiptPublicId) {
      try {
        await deleteFromCloudinary(transaction.receiptPublicId);
      } catch (cloudErr) {
        console.warn(
          `Failed to delete receipt from Cloudinary for transaction ${transactionId}:`,
          cloudErr
        );
      }
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      transactionId: transaction._id,
    });
  } catch (err) {
    console.error("deleteTransaction:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
