const crypto = require("crypto");
const CoinPackage = require("../../models/coin-package-model/coin.package.model");
const Transaction = require("../../models/transaction-model/transaction.model");
const User = require("../../models/user-model/user.model");

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
 * @description Initiate purchase: create a PENDING transaction
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
    const pkg = await CoinPackage.findById(packageId);

    if (!pkg || !pkg.isActive) {
      return res.status(404).json({
        success: false,
        message: "Package not available",
      });
    }

    const transaction = await Transaction.create({
      userId,
      packageId,
      amount: pkg.price,
      coins: pkg.coins,
      status: "PENDING",
      paymentMethod: "TEST", // Changed from PAYONEER to TEST for testing
      reference: `TEST_${crypto.randomBytes(8).toString("hex")}`,
    });

    // For testing, automatically complete the payment
    const completedTransaction = await this.completeTransaction(
      transaction._id
    );

    if (!completedTransaction.success) {
      return res.status(500).json({
        success: false,
        message: "Payment processing failed",
      });
    }

    res.status(201).json({
      success: true,
      message: "Purchase completed successfully",
      transaction: {
        id: completedTransaction.transaction._id,
        coins: completedTransaction.transaction.coins,
        amount: completedTransaction.transaction.amount,
        status: completedTransaction.transaction.status,
        package: {
          name: pkg.name,
          coins: pkg.coins,
          price: pkg.price,
          currency: pkg.currency,
        },
      },
      user: {
        oldBalance: completedTransaction.oldBalance,
        newBalance: completedTransaction.newBalance,
        userName: completedTransaction.userName,
      },
    });
  } catch (err) {
    console.error("buyCoinPackage:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Helper function to complete a transaction
 * @private
 */
exports.completeTransaction = async (transactionId) => {
  try {
    const tx = await Transaction.findById(transactionId).populate("packageId");
    if (!tx) {
      return { success: false, message: "Transaction not found" };
    }

    if (tx.status === "SUCCESS") {
      return { success: false, message: "Transaction already processed" };
    }

    // Update transaction status
    tx.status = "SUCCESS";
    tx.gatewayResponse = {
      simulated: true,
      timestamp: new Date(),
      payment_id: `test_pay_${crypto.randomBytes(6).toString("hex")}`,
    };
    await tx.save();

    // Add coins to user
    const user = await User.findById(tx.userId);
    if (!user) {
      tx.status = "FAILED";
      await tx.save();
      return { success: false, message: "User not found for transaction" };
    }

    const oldBalance = user.coins || 0;
    user.coins = oldBalance + tx.coins;
    await user.save();

    return {
      success: true,
      transaction: tx,
      oldBalance,
      newBalance: user.coins,
      userName: user.userName,
    };
  } catch (err) {
    console.error("completeTransaction:", err);
    return { success: false, message: "Server error" };
  }
};

/**
 * @description Simulate payment success (for manual testing)
 * @route POST /api/transaction/user/simulate-payment/:transactionId
 * @access Private (Authenticated Users)
 */
exports.simulatePaymentSuccess = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const result = await this.completeTransaction(transactionId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.transaction.coins} coins credited successfully`,
      transaction: {
        id: result.transaction._id,
        status: result.transaction.status,
        coins: result.transaction.coins,
        amount: result.transaction.amount,
        packageName: result.transaction.packageId.name,
      },
      user: {
        oldBalance: result.oldBalance,
        newBalance: result.newBalance,
        userId: result.transaction.userId,
        userName: result.userName,
      },
    });
  } catch (err) {
    console.error("simulatePaymentSuccess:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description Webhook for payment gateway (for real integration)
 * @route POST /api/transaction/user/payment-success/:transactionId
 * @access Public (Payment Gateway Webhook)
 */
exports.paymentSuccess = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { gatewayResponse } = req.body;

    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (tx.status === "SUCCESS") {
      return res.status(200).json({
        success: true,
        message: "Transaction already processed",
      });
    }

    tx.status = "SUCCESS";
    tx.gatewayResponse = gatewayResponse || null;
    await tx.save();

    const user = await User.findById(tx.userId);
    if (!user) {
      tx.status = "FAILED";
      await tx.save();
      return res.status(404).json({
        success: false,
        message: "User not found for transaction",
      });
    }

    user.coins = (user.coins || 0) + tx.coins;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${tx.coins} coins credited`,
      balance: user.coins,
    });
  } catch (err) {
    console.error("paymentSuccess:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
