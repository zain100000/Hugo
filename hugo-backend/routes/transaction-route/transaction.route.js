const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/auth.middleware");
const transactionController = require("../../controllers/transaction-controller/transaction.controller");
const recieptUpload = require("../../utilities/cloudinary/cloudinary.utility");

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
 * @desc Get transaction details by ID
 
 */
router.get(
  "/user/get-transaction-by-id/:transactionId",
  authMiddleware,
  transactionController.getTransactionById
);

/**
 * @desc Buy a coin package (manual payment with receipt)
 */
router.post(
  "/user/buy-package/:packageId",
  authMiddleware,
  recieptUpload.upload,
  transactionController.buyCoinPackage
);

/**
 * @desc Get all pending transactions for review
 */
router.get(
  "/super-admin/pending-transactions",
  authMiddleware,
  transactionController.getPendingTransactions
);

/**
 * @desc Approve transaction
 */
router.patch(
  "/super-admin/approve-transaction/:transactionId",
  authMiddleware,
  transactionController.approveTransaction
);

/**
 * @desc Reject transaction
 */
router.patch(
  "/super-admin/reject-transaction/:transactionId",
  authMiddleware,
  transactionController.rejectTransaction
);

/**
 * @desc Get all transactions (Admin view with filters + pagination)
 */
router.get(
  "/admin/all-transactions",
  authMiddleware,
  transactionController.getAllTransactions
);

module.exports = router;
