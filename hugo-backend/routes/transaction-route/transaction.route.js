const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const transactionController = require("../../controllers/transaction-controller/transaction.controller");

/**
 * @desc Get logged-in user coin balance
 */
router.get(
  "/user/get-user-balance",
  authMiddleware,
  transactionController.getUserBalance
);

/**
 * @desc Get logged-in user transaction history
 */
router.get(
  "/user/get-user-transactions",
  authMiddleware,
  transactionController.getUserTransactions
);

/**
 * @desc Buy a coin package (initiates payment)
 */
router.post(
  "/user/buy/:packageId",
  authMiddleware,
  transactionController.buyCoinPackage
);

/**
 * @desc Simulate successful payment (for testing only)
 */
router.post(
  "/user/simulate-payment/:transactionId",
  authMiddleware,
  transactionController.simulatePaymentSuccess
);

/**
 * @desc Webhook for real payment gateway callback (Payoneer, Stripe, etc.)
 */
router.post(
  "/user/payment-success/:transactionId",
  transactionController.paymentSuccess
);

module.exports = router;
