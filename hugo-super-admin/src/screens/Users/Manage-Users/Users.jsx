/**
 * ManageUsers Component
 *
 * Provides an interface for admins/super-admins to manage users.
 * Features include:
 * - Fetching users from the Redux store
 * - Searching users by username, email, or phone
 * - Viewing user details and status
 * - Managing user status (active/suspended/banned/warned)
 * - Warning users with custom messages
 * - Optimistic UI updates for status changes
 * - Displaying backend toast messages for actions
 * - Responsive table with user avatars and status indicators
 *
 * @component
 * @example
 * return (
 *   <ManageUsers />
 * )
 */

import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Users.css";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, updateUserStatus } from "../../../redux/slices/user.slice";
import Modal from "../../../utilities/Modal/Modal.utlity";
import { toast } from "react-hot-toast";
import InputField from "../../../utilities/InputField/InputField.utility";
import Loader from "../../../utilities/Loader/Loader.utility";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isWarnModalOpen, setIsWarnModalOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [localUsers, setLocalUsers] = useState([]);

  // Load users
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getUsers())
        .unwrap()
        .then((users) => setLocalUsers(users))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [dispatch, user?.id]);

  // Filter users by search
  const filteredUsers = (localUsers || []).filter(
    (usr) =>
      usr.userName?.toLowerCase().includes(search.toLowerCase()) ||
      usr.email?.toLowerCase().includes(search.toLowerCase()) ||
      usr.phone?.includes(search)
  );

  const handleSearch = (e) => setSearch(e.target.value);

  // Update user status
  const handleStatusChange = (usr, status) => {
    setSelectedUser(usr);
    setNewStatus(status);
    setIsStatusModalOpen(true);
  };

  // Warn user
  const handleWarnUser = (usr) => {
    setSelectedUser(usr);
    setNewStatus("WARNED");
    setIsWarnModalOpen(true);
  };

  const updateUserStatusHandler = async () => {
    if (!selectedUser) return;
    const userId = selectedUser._id;
    setLoadingAction(`STATUS_${userId}`);

    // Optimistic update
    const previousStatus = selectedUser.status;
    const previousWarnings = selectedUser.warnings?.length || 0;

    setLocalUsers((prev) =>
      prev.map((u) =>
        u._id === userId
          ? {
              ...u,
              status: newStatus,
              warnings:
                newStatus === "WARNED"
                  ? [
                      ...(u.warnings || []),
                      {
                        warningMessage: statusNotes,
                        timestamp: new Date().toISOString(),
                      },
                    ]
                  : u.warnings,
            }
          : u
      )
    );

    try {
      const response = await dispatch(
        updateUserStatus({
          userId: userId,
          status: newStatus,
          adminNotes: statusNotes,
        })
      ).unwrap();

      toast.success(
        response?.message || `User ${newStatus.toLowerCase()} successfully!`
      );
    } catch (error) {
      toast.error(error?.message || `Error while updating user status.`);
      // Rollback optimistic update on failure
      setLocalUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                status: previousStatus,
                warnings: u.warnings?.slice(0, previousWarnings) || [],
              }
            : u
        )
      );
    } finally {
      setLoadingAction(null);
      setIsStatusModalOpen(false);
      setIsWarnModalOpen(false);
      setStatusNotes("");
      setWarningMessage("");
      setSelectedUser(null);
      setNewStatus("");
    }
  };

  const warnUserHandler = async () => {
    if (!selectedUser) return;
    const userId = selectedUser._id;
    setLoadingAction(`WARN_${userId}`);

    // Check if user should be suspended after 3 warnings
    const currentWarnings = selectedUser.warnings?.length || 0;
    const shouldSuspend = currentWarnings >= 2; // After 3rd warning (0-indexed)

    // Optimistic update
    const previousStatus = selectedUser.status;
    const previousWarnings = selectedUser.warnings?.length || 0;

    setLocalUsers((prev) =>
      prev.map((u) =>
        u._id === userId
          ? {
              ...u,
              status: shouldSuspend ? "SUSPENDED" : "WARNED",
              warnings: [
                ...(u.warnings || []),
                {
                  warningMessage: warningMessage,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : u
      )
    );

    try {
      const response = await dispatch(
        updateUserStatus({
          userId: userId,
          status: shouldSuspend ? "SUSPENDED" : "WARNED",
          adminNotes: `Warning: ${warningMessage}. ${
            shouldSuspend ? "User suspended after 3 warnings." : ""
          }`,
        })
      ).unwrap();

      const actionMessage = shouldSuspend
        ? "User suspended after 3 warnings!"
        : "User warned successfully!";

      toast.success(response?.message || actionMessage);
    } catch (error) {
      toast.error(error?.message || `Error while warning user.`);
      // Rollback optimistic update on failure
      setLocalUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                status: previousStatus,
                warnings: u.warnings?.slice(0, previousWarnings) || [],
              }
            : u
        )
      );
    } finally {
      setLoadingAction(null);
      setIsWarnModalOpen(false);
      setWarningMessage("");
      setSelectedUser(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "status-active";
      case "SUSPENDED":
        return "status-suspended";
      case "BANNED":
        return "status-banned";
      case "WARNED":
        return "status-warned";
      default:
        return "status-pending";
    }
  };

  const handleViewUserDetails = (user) => {
    navigate(`/super-admin/users/user-details/${user._id}`, {
      state: { user },
    });
  };

  return (
    <section id="manage-users">
      <div className="users-container">
        <h2 className="users-title">Manage Users</h2>
        <div className="users-header">
          <InputField
            placeholder="Search by name, email, phone"
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
          ) : filteredUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>UID</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Warnings</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((usr) => (
                  <tr key={usr._id}>
                    <td>#{usr._id.slice(0, 8)}</td>
                    <td className="user-cell">
                      <img
                        src={usr.profilePicture}
                        alt="profile"
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/40x40/007bff/ffffff?text=U";
                        }}
                      />
                      <div className="user-info">
                        <div className="user-name">{usr.userName}</div>
                        <div className="user-email">{usr.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(usr.status)}`}>
                        {usr.status}
                      </span>
                    </td>
                    <td className="warnings-cell">
                      <span
                        className={`warnings-count ${
                          usr.warnings?.length >= 3
                            ? "warnings-high"
                            : usr.warnings?.length >= 1
                            ? "warnings-medium"
                            : ""
                        }`}
                      >
                        {usr.warnings?.length || 0}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`verification ${
                          usr.isVerified ? "verified" : "not-verified"
                        }`}
                      >
                        <i
                          className={`fas ${
                            usr.isVerified
                              ? "fa-check-circle"
                              : "fa-times-circle"
                          }`}
                        ></i>
                        {usr.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </td>
                    <td>{formatDate(usr.createdAt)}</td>
                    <td className="actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewUserDetails(usr)}
                        title="View User Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      {/* Warn button - always visible except for suspended/banned */}
                      {usr.status !== "SUSPENDED" &&
                        usr.status !== "BANNED" && (
                          <button
                            className="action-btn warn-btn"
                            onClick={() => handleWarnUser(usr)}
                            disabled={loadingAction === `WARN_${usr._id}`}
                            title="Warn User"
                          >
                            <i className="fas fa-exclamation-triangle"></i>
                          </button>
                        )}

                      {usr.status !== "SUSPENDED" &&
                        usr.status !== "WARNED" && (
                          <button
                            className="action-btn suspend-btn"
                            onClick={() => handleStatusChange(usr, "SUSPENDED")}
                            disabled={loadingAction === `STATUS_${usr._id}`}
                            title="Suspend User"
                          >
                            <i className="fas fa-pause"></i>
                          </button>
                        )}

                      {usr.status !== "BANNED" && (
                        <button
                          className="action-btn ban-btn"
                          onClick={() => handleStatusChange(usr, "BANNED")}
                          disabled={loadingAction === `STATUS_${usr._id}`}
                          title="Ban User"
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      )}

                      {(usr.status === "SUSPENDED" ||
                        usr.status === "BANNED" ||
                        usr.status === "WARNED") && (
                        <button
                          className="action-btn activate-btn"
                          onClick={() => handleStatusChange(usr, "ACTIVE")}
                          disabled={loadingAction === `STATUS_${usr._id}`}
                          title="Activate User"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-users-found">
              <div className="empty-content">
                <i className="fas fa-users"></i>
                <p>No Users Found</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Change Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Change User Status to ${newStatus}`}
          loading={loadingAction?.startsWith("STATUS")}
          buttons={[
            {
              label: "Update Status",
              className: "primary-btn",
              onClick: updateUserStatusHandler,
              loading: loadingAction?.startsWith("STATUS"),
            },
          ]}
        >
          <p>Please provide notes for this status change:</p>
          <textarea
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            rows={4}
            cols={46}
            placeholder="Enter reason for status change..."
          />
          {selectedUser && (
            <div className="user-details">
              <p>
                <strong>User:</strong> {selectedUser.userName}
              </p>
              <p>
                <strong>Current Status:</strong> {selectedUser.status}
              </p>
              <p>
                <strong>New Status:</strong> {newStatus}
              </p>
              <p>
                <strong>Current Warnings:</strong>{" "}
                {selectedUser.warnings?.length || 0}
              </p>
            </div>
          )}
        </Modal>

        {/* Warn User Modal */}
        <Modal
          isOpen={isWarnModalOpen}
          onClose={() => setIsWarnModalOpen(false)}
          title="Warn User"
          loading={loadingAction?.startsWith("WARN")}
          buttons={[
            {
              label: "Send Warning",
              className: "warning-btn",
              onClick: warnUserHandler,
              loading: loadingAction?.startsWith("WARN"),
            },
          ]}
        >
          <p>Please provide a warning message:</p>
          <textarea
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            rows={4}
            cols={46}
            placeholder="Enter warning message for the user..."
          />
          {selectedUser && (
            <div className="user-details">
              <p>
                <strong>User:</strong> {selectedUser.userName}
              </p>
              <p>
                <strong>Current Status:</strong> {selectedUser.status}
              </p>
              <p>
                <strong>Current Warnings:</strong>{" "}
                {selectedUser.warnings?.length || 0}/3
              </p>
              {selectedUser.warnings && selectedUser.warnings.length > 0 && (
                <div className="previous-warnings">
                  <strong>Previous Warnings:</strong>
                  <ul>
                    {selectedUser.warnings.map((warning, index) => (
                      <li key={index}>- {warning.warningMessage}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedUser.warnings?.length >= 2 && (
                <p className="warning-note">
                  <strong>Note:</strong> This will be the 3rd warning. User will
                  be automatically suspended.
                </p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};

export default ManageUsers;
