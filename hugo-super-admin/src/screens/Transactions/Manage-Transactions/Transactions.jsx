/**
 * ManageTransactions Component
 *
 * Provides an interface for admins/super-admins to manage transactions.
 * Features include:
 * - Fetching transactions from the Redux store
 * - Searching transactions by username
 * - Approving and rejecting transactions with optional admin notes
 * - Deleting transactions with confirmation modal
 * - Optimistic UI updates for status changes
 * - Displaying backend toast messages for actions
 * - Responsive table with user avatars, receipt thumbnails, and status indicators
 *
 * @component
 * @example
 * return (
 *   <ManageTransactions />
 * )
 */

import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Transactions.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllTransactions,
  approveTransaction,
  rejectTransaction,
  deleteTransaction,
} from "../../../redux/slices/transaction.slice";
import Modal from "../../../utilities/Modal/Modal.utlity";
import { toast } from "react-hot-toast";
import InputField from "../../../utilities/InputField/InputField.utility";
import Loader from "../../../utilities/Loader/Loader.utility";

const ManageTransactions = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  // const transactions = useSelector((state) => state.transactions.transactions); // transactions state is now managed locally for optimistic updates

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [localTransactions, setLocalTransactions] = useState([]);

  // Load transactions
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllTransactions())
        .unwrap()
        .then((txs) => setLocalTransactions(txs))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [dispatch, user?.id]);

  // Filter transactions by search
  const filteredTransactions = (localTransactions || []).filter((tx) =>
    tx.userId?.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => setSearch(e.target.value);

  // Approve transaction
  const handleApprove = async (tx) => {
    setLoadingAction(`APPROVE_${tx._id}`);

    // Optimistic update
    setLocalTransactions((prev) =>
      prev.map((t) => (t._id === tx._id ? { ...t, status: "SUCCESS" } : t))
    );

    try {
      const response = await dispatch(approveTransaction(tx._id)).unwrap();
      // Use backend message if available
      toast.success(response?.message || "Transaction approved!");
    } catch (error) {
      toast.error(error?.message || "Error while approving transaction.");
      // Rollback optimistic update on failure
      setLocalTransactions((prev) =>
        prev.map((t) =>
          t._id === tx._id ? { ...t, status: "PENDING_REVIEW" } : t
        )
      );
    } finally {
      setLoadingAction(null);
    }
  };

  // Reject transaction modal open
  const handleReject = (tx) => {
    setSelectedTransaction(tx);
    setIsRejectModalOpen(true);
  };

  // Reject transaction handler
  const rejectTransactionHandler = async () => {
    if (!selectedTransaction) return;
    const txId = selectedTransaction._id;
    setLoadingAction(`REJECT_${txId}`);

    // Optimistic update
    setLocalTransactions((prev) =>
      prev.map((t) => (t._id === txId ? { ...t, status: "REJECTED" } : t))
    );

    try {
      const response = await dispatch(
        rejectTransaction({
          transactionId: txId,
          adminNotes: rejectNotes,
        })
      ).unwrap();

      toast.success(response?.message || "Transaction rejected!");
    } catch (error) {
      toast.error(error?.message || "Error while rejecting transaction.");
      // Rollback optimistic update on failure
      setLocalTransactions((prev) =>
        prev.map((t) =>
          t._id === txId ? { ...t, status: "PENDING_REVIEW" } : t
        )
      );
    } finally {
      setLoadingAction(null);
      setIsRejectModalOpen(false);
      setRejectNotes("");
      setSelectedTransaction(null);
    }
  };

  // Delete transaction handler
  const deleteTransactionHandler = async () => {
    if (!selectedTransaction) return;
    const txId = selectedTransaction._id;
    setLoadingAction(`DELETE_${txId}`);

    // Optimistic removal (store the transaction data before removing for rollback)
    const transactionToRemove = selectedTransaction;
    setLocalTransactions((prev) => prev.filter((t) => t._id !== txId));

    try {
      const response = await dispatch(deleteTransaction(txId)).unwrap();

      toast.success(response?.message || "Transaction deleted successfully!");
    } catch (error) {
      toast.error(error?.message || "Error while deleting transaction.");
      // Rollback optimistic update on failure
      setLocalTransactions((prev) => [...prev, transactionToRemove]);
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleDelete = (tx) => {
    setSelectedTransaction(tx);
    setIsDeleteModalOpen(true);
  };

  return (
    <section id="transactions">
      <div className="transactions-container">
        <h2 className="transactions-title">Transactions List</h2>
        <div className="transactions-header">
          <InputField
            placeholder="Search by User"
            type="text"
            editable
            value={search}
            onChange={handleSearch}
            icon={<i className="fas fa-search"></i>}
            textColor="#000"
            width={300}
          />
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>TID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Coins</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>#{tx._id.slice(0, 8)}</td>
                    <td className="user-cell">
                      <img
                        src={tx.userId?.profilePicture}
                        alt="profile"
                        className="user-avatar"
                      />
                      <div>{tx.userId?.userName}</div>
                    </td>
                    <td>PKR {tx.amount}</td>
                    <td>{tx.coins}</td>
                    <td>
                      <span
                        className={`status ${
                          tx.status === "PENDING_REVIEW"
                            ? "status-pending"
                            : tx.status === "SUCCESS"
                            ? "status-approved"
                            : "status-rejected"
                        }`}
                      >
                        {tx.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {tx.receiptUrl ? (
                        <a
                          href={tx.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={tx.receiptUrl}
                            alt="receipt"
                            className="receipt-thumb"
                          />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(tx)}
                        disabled={loadingAction === `DELETE_${tx._id}`}
                        title="Delete Transaction"
                      >
                        <i className="fas fa-trash"></i>
                      </button>

                      {tx.status === "PENDING_REVIEW" && (
                        <>
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleApprove(tx)}
                            disabled={loadingAction === `APPROVE_${tx._id}`}
                            title="Approve Transaction"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => handleReject(tx)}
                            disabled={loadingAction === `REJECT_${tx._id}`}
                            title="Reject Transaction"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-transactions-found">
              <div className="empty-content">
                <i className="fas fa-receipt"></i>
                <p>No Transactions Found</p>
              </div>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject Transaction"
          loading={loadingAction?.startsWith("REJECT")}
          buttons={[
            {
              label: "Reject",
              className: "danger-btn",
              onClick: rejectTransactionHandler,
              loading: loadingAction?.startsWith("REJECT"),
            },
          ]}
        >
          <p>Please provide rejection notes:</p>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "10px" }}
          />
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Transaction"
          loading={loadingAction?.startsWith("DELETE")}
          buttons={[
            {
              label: "Cancel",
              className: "secondary-btn",
              onClick: () => setIsDeleteModalOpen(false),
            },
            {
              label: "Delete",
              className: "danger-btn",
              onClick: deleteTransactionHandler,
              loading: loadingAction?.startsWith("DELETE"),
            },
          ]}
        >
          <p>Are you sure you want to delete this transaction?</p>
          <p className="text-muted">
            This action cannot be undone. All transaction data will be
            permanently removed.
          </p>
          {selectedTransaction && (
            <div className="transaction-details">
              <p>
                <strong>TID:</strong> #{selectedTransaction._id.slice(0, 8)}
              </p>
              <p>
                <strong>User:</strong> {selectedTransaction.userId?.userName}
              </p>
              <p>
                <strong>Amount:</strong> PKR {selectedTransaction.amount}
              </p>
              <p>
                <strong>Coins:</strong> {selectedTransaction.coins}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedTransaction.status.replace("_", " ")}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};

export default ManageTransactions;
