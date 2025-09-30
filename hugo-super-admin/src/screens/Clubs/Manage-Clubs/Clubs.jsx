/**
 * ManageClubs Component with Enhanced Messaging Modal and Member Moderation
 *
 * Provides super-admin functionality to manage clubs with improved messaging interface and member moderation.
 */
import { useEffect, useState } from "react";
import "../../../styles/global.styles.css";
import "./Clubs.css";
import Modal from "../../../utilities/Modal/Modal.utlity";
import InputField from "../../../utilities/InputField/InputField.utility";
import Loader from "../../../utilities/Loader/Loader.utility";
import { toast } from "react-hot-toast";
import { useClubEvents } from "../../../utilities/Socket/Chat-Events/Chat.events.utility";
import { useNavigate } from "react-router-dom";

const ManageClubs = () => {
  const navigate = useNavigate();
  const {
    allClubs,
    getAllClubs,
    deleteClub,
    getAllClubMessages,
    messages,
    deleteMessage,
    getClubMembers,
    clubMembers,
    // Add moderation functions from hook
    kickMember,
    banMember,
    muteMember,
    // Add setters from hook for better control
    setMessages,
    setClubMembers,
  } = useClubEvents();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isDeleteMessageModalOpen, setIsDeleteMessageModalOpen] =
    useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  // Fetch clubs on mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        await getAllClubs();
      } catch {
        toast.error("Failed to fetch clubs");
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  /**
   * Handle club deletion
   */
  const handleDeleteClub = async (clubId) => {
    setLoadingAction(`delete-${clubId}`);
    try {
      await deleteClub(clubId);
      toast.success("Club deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete club");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Handle viewing club messages
   */
  const handleViewMessages = async (club) => {
    try {
      // Clear previous messages before loading new ones
      setMessages([]);
      setSelectedClub(club);
      setMessagesLoading(true);
      setIsMessagesModalOpen(true);

      await getAllClubMessages(club._id);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  /**
   * Handle viewing club members
   */
  const handleViewMembers = async (club) => {
    try {
      setSelectedClub(club);
      setMembersLoading(true);
      setIsMembersModalOpen(true);

      await getClubMembers(club._id);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  /**
   * Handle deleting a message
   */
  const handleDeleteMessage = async () => {
    if (!selectedMessage || !selectedClub) return;

    setLoadingAction(`delete-message-${selectedMessage._id}`);
    try {
      await deleteMessage(
        selectedClub._id,
        selectedMessage._id,
        "SuperAdmin moderation"
      );
      // The state update is handled by the useClubEvents real-time listener
      toast.success("Message deleted successfully");
      setIsDeleteMessageModalOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete message");
    } finally {
      setLoadingAction(null);
    }
  };

  // In your ManageClubs component, update the moderation handlers:

  /**
   * Handle kicking a member
   */
  const handleKickMember = async () => {
    if (!selectedMember || !selectedClub) return;

    setLoadingAction(`kick-${selectedMember.user._id}`);
    try {
      const result = await kickMember(
        selectedClub._id,
        selectedMember.user._id
      );

      if (result.success) {
        toast.success(result.message);
        setIsKickModalOpen(false);
        setSelectedMember(null);

        // Only refresh if it's a real backend response, not simulated
        if (!result.message.includes("simulated")) {
          await getClubMembers(selectedClub._id);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to kick member");
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Handle banning a member
   */
  const handleBanMember = async () => {
    if (!selectedMember || !selectedClub) return;

    setLoadingAction(`ban-${selectedMember.user._id}`);
    try {
      const result = await banMember(selectedClub._id, selectedMember.user._id);

      if (result.success) {
        toast.success(result.message);
        setIsBanModalOpen(false);
        setSelectedMember(null);

        // Only refresh if it's a real backend response, not simulated
        if (!result.message.includes("simulated")) {
          await getClubMembers(selectedClub._id);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to ban member");
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Handle muting a member
   */
  const handleMuteMember = async () => {
    if (!selectedMember || !selectedClub) return;

    setLoadingAction(`mute-${selectedMember.user._id}`);
    try {
      const result = await muteMember(
        selectedClub._id,
        selectedMember.user._id
      );

      if (result.success) {
        toast.success(result.message);
        setIsMuteModalOpen(false);
        setSelectedMember(null);

        // Only refresh if it's a real backend response, not simulated
        if (!result.message.includes("simulated")) {
          await getClubMembers(selectedClub._id);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to mute member");
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Open delete message modal
   */
  const openDeleteMessageModal = (message) => {
    setSelectedMessage(message);
    setIsDeleteMessageModalOpen(true);
  };

  /**
   * Open kick member modal
   */
  const openKickModal = (member) => {
    setSelectedMember(member);
    setIsKickModalOpen(true);
  };

  /**
   * Open ban member modal
   */
  const openBanModal = (member) => {
    setSelectedMember(member);
    setIsBanModalOpen(true);
  };

  /**
   * Open mute member modal
   */
  const openMuteModal = (member) => {
    setSelectedMember(member);
    setIsMuteModalOpen(true);
  };

  /**
   * Reset all modals
   */
  const resetModals = () => {
    setIsDeleteModalOpen(false);
    setIsMessagesModalOpen(false);
    setIsDeleteMessageModalOpen(false);
    setIsMembersModalOpen(false);
    setIsKickModalOpen(false);
    setIsBanModalOpen(false);
    setIsMuteModalOpen(false);
    setSelectedClub(null);
    setSelectedMessage(null);
    setSelectedMember(null);
    setLoadingAction(null);
  };

  /**
   * Format relative time for display
   */
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    // Show relative time for recent messages
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes < 1) return "Just now";
        return `${diffInMinutes}m ago`;
      }
      return `${Math.floor(diffInHours)}h ago`;
    }

    // Show full date for older messages
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Format date for messages with proper validation
   * Handles missing createdAt field by using fallback options
   */
  const formatMessageTime = (message) => {
    let dateToFormat = null;

    // 1. Try to get createdAt from the message
    if (message.createdAt) {
      try {
        const date = new Date(message.createdAt);
        if (!isNaN(date.getTime())) {
          dateToFormat = date;
        }
      } catch (e) {
        console.warn("Invalid date format in message.createdAt", e);
      }
    }

    // 2. Fallback: try to extract timestamp from _id (MongoDB ObjectId)
    if (!dateToFormat && message._id) {
      try {
        if (typeof message._id === "string" && message._id.length >= 8) {
          // Extract timestamp from ObjectId (first 4 bytes)
          const timestamp = parseInt(message._id.substring(0, 8), 16);
          const date = new Date(timestamp * 1000);
          if (!isNaN(date.getTime())) {
            dateToFormat = date;
          }
        }
      } catch (e) {
        console.warn("Failed to extract date from message._id", e);
      }
    }

    // 3. Final check and formatting
    if (dateToFormat) {
      return formatRelativeTime(dateToFormat);
    }

    // Final fallback
    return "Time Unknown";
  };

  /**
   * Format member role with badge styling
   */
  const getRoleBadge = (role) => {
    const roleConfig = {
      ADMIN: { class: "role-admin", icon: "fa-crown" },
      MODERATOR: { class: "role-moderator", icon: "fa-shield-alt" },
      MEMBER: { class: "role-member", icon: "fa-user" },
    };

    const config = roleConfig[role] || roleConfig.MEMBER;

    return (
      <span className={`role-badge ${config.class}`}>
        <i className={`fas ${config.icon}`}></i>
        {role}
      </span>
    );
  };

  /**
   * Format member status with badge styling
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { class: "status-active", icon: "fa-check-circle" },
      MUTED: { class: "status-muted", icon: "fa-volume-mute" },
      BANNED: { class: "status-banned", icon: "fa-ban" },
      KICKED: { class: "status-kicked", icon: "fa-sign-out-alt" },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;

    return (
      <span className={`status-badge ${config.class}`}>
        <i className={`fas ${config.icon}`}></i>
        {status}
      </span>
    );
  };

  // Filter clubs by search
  const filteredClubs = allClubs.filter((club) =>
    club.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="manage-clubs">
      <div className="clubs-container">
        <h2 className="clubs-title">Manage Clubs ({allClubs.length})</h2>
        <div className="clubs-header">
          <InputField
            placeholder="Search by club name"
            type="text"
            editable
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          ) : filteredClubs.length > 0 ? (
            <table className="clubs-table">
              <thead>
                <tr>
                  <th>CID</th>
                  <th>Club</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Members</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.map((club) => (
                  <tr key={club._id}>
                    <td>#{club._id?.slice(0, 8)}</td>
                    <td className="club-cell">
                      <div className="club-info">
                        <div className="club-name">{club.name}</div>
                      </div>
                    </td>
                    <td className="owner-cell">
                      <div className="owner-info">
                        <div className="owner-name">
                          {club.admin?.userName || "Unknown"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          club.isPublic ? "status-active" : "status-suspended"
                        }`}
                      >
                        {club.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="members-cell">
                      <span className="members-count">
                        {club.members?.length || 0}
                      </span>
                    </td>

                    <td>{new Date(club.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        className="action-btn messages-btn"
                        onClick={() => handleViewMessages(club)}
                        title="View Messages"
                        disabled={messagesLoading}
                      >
                        <i className="fas fa-comments"></i>
                      </button>

                      <button
                        className="action-btn members-btn"
                        onClick={() => handleViewMembers(club)}
                        title="View Members"
                        disabled={membersLoading}
                      >
                        <i className="fas fa-users"></i>
                      </button>

                      <button
                        className="action-btn view-btn"
                        onClick={() =>
                          navigate(
                            `/super-admin/clubs/club-details/${club._id}`,
                            { state: { club } }
                          )
                        }
                        title="View Club Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          setSelectedClub(club);
                          setIsDeleteModalOpen(true);
                        }}
                        disabled={loadingAction === `delete-${club._id}`}
                        title="Delete Club"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-clubs-found">
              <div className="empty-content">
                <i className="fas fa-users"></i>
                <p>No Clubs Found</p>
                {search && (
                  <p className="search-hint">Try adjusting your search terms</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Club Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={resetModals}
          title="Delete Club"
          loading={loadingAction?.startsWith("delete-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Delete Club",
              className: "danger-btn",
              onClick: () => handleDeleteClub(selectedClub?._id),
              loading: loadingAction === `delete-${selectedClub?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedClub?.name}</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone. All club data including messages and
            members will be permanently deleted.
          </p>
          {selectedClub && (
            <div className="club-details">
              <p>
                <strong>Club ID:</strong> #{selectedClub._id?.slice(0, 8)}
              </p>
              <p>
                <strong>Owner:</strong>{" "}
                {selectedClub.admin?.userName || "Unknown"}
              </p>
              <p>
                <strong>Members:</strong> {selectedClub.members?.length || 0}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(selectedClub.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </Modal>

        {/* Enhanced Messages Modal */}
        <Modal
          isOpen={isMessagesModalOpen}
          onClose={resetModals}
          title={`${selectedClub?.name} - Messages (${messages.length})`}
          size="medium"
        >
          <div className="messages-modal-content">
            {/* Messages Container */}
            <div className="messages-container-enhanced">
              {messagesLoading ? (
                <div className="loader-container">
                  <Loader />
                </div>
              ) : messages.length === 0 ? (
                <div className="no-messages-found">
                  <i className="fas fa-comment-slash"></i>
                  <p>No messages found in this club</p>
                </div>
              ) : (
                <div className="messages-scrollable">
                  {messages.map((message) => (
                    <div key={message._id} className="message-bubble">
                      <div className="message-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="message-content-enhanced">
                        <div className="message-header-enhanced">
                          <div className="message-user-info">
                            <strong className="message-username">
                              {message.sender?.userName || "Unknown User"}
                            </strong>
                            <span className="message-time-enhanced">
                              {formatMessageTime(message)}
                            </span>
                          </div>
                          {/* Show delete button only if message is NOT already deleted */}
                          {!message.isDeleted && (
                            <button
                              className="action-btn delete-btn small"
                              onClick={() => openDeleteMessageModal(message)}
                              title="Delete Message"
                              disabled={loadingAction?.startsWith(
                                "delete-message-"
                              )}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                        <div className="message-text-enhanced">
                          {/* Show deleted message styling */}
                          {message.isDeleted ? (
                            <div className="deleted-message">
                              <i className="fas fa-ban"></i>
                              <span>
                                This message was deleted
                                {message.deleteReason &&
                                  `: ${message.deleteReason}`}
                              </span>
                            </div>
                          ) : (
                            message.text
                          )}
                        </div>
                        {/* Show original message type badge if not deleted */}
                        {!message.isDeleted && message.type !== "TEXT" && (
                          <div className="message-type-badge">
                            <i
                              className={`fas ${
                                message.type === "IMAGE"
                                  ? "fa-image"
                                  : message.type === "VIDEO"
                                  ? "fa-video"
                                  : message.type === "ANNOUNCEMENT"
                                  ? "fa-bullhorn"
                                  : message.type === "SYSTEM"
                                  ? "fa-shield-alt"
                                  : "fa-comment"
                              }`}
                            ></i>
                            {message.type}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Members Modal */}
        <Modal
          isOpen={isMembersModalOpen}
          onClose={resetModals}
          title={`${selectedClub?.name} - Members (${clubMembers.length})`}
          size="large"
        >
          <div className="members-modal-content">
            {membersLoading ? (
              <div className="loader-container">
                <Loader />
              </div>
            ) : clubMembers.length === 0 ? (
              <div className="no-members-found">
                <i className="fas fa-user-slash"></i>
                <p>No members found in this club</p>
              </div>
            ) : (
              <div className="members-scrollable">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubMembers.map((member) => (
                      <tr key={member._id}>
                        <td className="member-user-cell">
                          <div className="member-user-info">
                            <div className="member-details">
                              <div className="member-name">
                                {member.user?.userName || "Unknown User"}
                              </div>
                              {member.user?._id === selectedClub?.admin && (
                                <div className="club-admin-badge">
                                  <i className="fas fa-crown"></i>
                                  Club Admin
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{getRoleBadge(member.role)}</td>
                        <td>{getStatusBadge(member.status)}</td>
                        <td>
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="member-actions">
                          {/* Don't show actions for the club admin */}
                          {member.user?._id !== selectedClub?.admin && (
                            <>
                              <button
                                className="action-btn kick-btn small"
                                onClick={() => openKickModal(member)}
                                title="Kick Member"
                                disabled={loadingAction?.startsWith("kick-")}
                              >
                                <i className="fas fa-sign-out-alt"></i>
                              </button>
                              <button
                                className="action-btn ban-btn small"
                                onClick={() => openBanModal(member)}
                                title="Ban Member"
                                disabled={loadingAction?.startsWith("ban-")}
                              >
                                <i className="fas fa-ban"></i>
                              </button>
                              <button
                                className="action-btn mute-btn small"
                                onClick={() => openMuteModal(member)}
                                title="Mute Member"
                                disabled={loadingAction?.startsWith("mute-")}
                              >
                                <i className="fas fa-volume-mute"></i>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>

        {/* Delete Message Modal */}
        <Modal
          isOpen={isDeleteMessageModalOpen}
          onClose={resetModals}
          title="Delete Message"
          loading={loadingAction?.startsWith("delete-message-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Delete Message",
              className: "danger-btn",
              onClick: handleDeleteMessage,
              loading:
                loadingAction === `delete-message-${selectedMessage?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to delete this message from{" "}
            <strong>
              {selectedMessage?.sender?.userName || "Unknown User"}
            </strong>
            ?
          </p>
          <div className="message-preview">
            <strong>Message:</strong>
            <p>"{selectedMessage?.text}"</p>
          </div>
          <p className="warning-text">
            This action cannot be undone and the message will be permanently
            removed from the club.
          </p>
        </Modal>

        {/* Kick Member Modal */}
        <Modal
          isOpen={isKickModalOpen}
          onClose={resetModals}
          title="Kick Member"
          loading={loadingAction?.startsWith("kick-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Kick Member",
              className: "warning-btn",
              onClick: handleKickMember,
              loading: loadingAction === `kick-${selectedMember?.user?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to kick{" "}
            <strong>{selectedMember?.user?.userName || "Unknown User"}</strong>{" "}
            from <strong>{selectedClub?.name}</strong>?
          </p>
          <div className="member-details-preview">
            <p>
              <strong>User:</strong>{" "}
              {selectedMember?.user?.userName || "Unknown User"}
            </p>
            <p>
              <strong>Role:</strong> {selectedMember?.role}
            </p>
            <p>
              <strong>Status:</strong> {selectedMember?.status}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {selectedMember?.joinedAt
                ? new Date(selectedMember.joinedAt).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
          <p className="warning-text">
            The member will be removed from the club but can rejoin if the club
            is public.
          </p>
        </Modal>

        {/* Ban Member Modal */}
        <Modal
          isOpen={isBanModalOpen}
          onClose={resetModals}
          title="Ban Member"
          loading={loadingAction?.startsWith("ban-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Ban Member",
              className: "danger-btn",
              onClick: handleBanMember,
              loading: loadingAction === `ban-${selectedMember?.user?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to ban{" "}
            <strong>{selectedMember?.user?.userName || "Unknown User"}</strong>{" "}
            from <strong>{selectedClub?.name}</strong>?
          </p>
          <div className="member-details-preview">
            <p>
              <strong>User:</strong>{" "}
              {selectedMember?.user?.userName || "Unknown User"}
            </p>
            <p>
              <strong>Role:</strong> {selectedMember?.role}
            </p>
            <p>
              <strong>Status:</strong> {selectedMember?.status}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {selectedMember?.joinedAt
                ? new Date(selectedMember.joinedAt).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
          <p className="warning-text">
            The member will be permanently banned and cannot rejoin the club.
            This action cannot be undone.
          </p>
        </Modal>

        {/* Mute Member Modal */}
        <Modal
          isOpen={isMuteModalOpen}
          onClose={resetModals}
          title="Mute Member"
          loading={loadingAction?.startsWith("mute-")}
          buttons={[
            {
              label: "Cancel",
              className: "btn-secondary",
              onClick: resetModals,
            },
            {
              label: "Mute Member",
              className: "warning-btn",
              onClick: handleMuteMember,
              loading: loadingAction === `mute-${selectedMember?.user?._id}`,
            },
          ]}
        >
          <p>
            Are you sure you want to mute{" "}
            <strong>{selectedMember?.user?.userName || "Unknown User"}</strong>{" "}
            in <strong>{selectedClub?.name}</strong>?
          </p>
          <div className="member-details-preview">
            <p>
              <strong>User:</strong>{" "}
              {selectedMember?.user?.userName || "Unknown User"}
            </p>
            <p>
              <strong>Role:</strong> {selectedMember?.role}
            </p>
            <p>
              <strong>Status:</strong> {selectedMember?.status}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {selectedMember?.joinedAt
                ? new Date(selectedMember.joinedAt).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
          <p className="warning-text">
            The member will be unable to send messages in the club until unmuted
            by an admin.
          </p>
        </Modal>
      </div>
    </section>
  );
};

export default ManageClubs;
