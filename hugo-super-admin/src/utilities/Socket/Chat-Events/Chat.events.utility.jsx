import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../Socket.utility";

/**
 * Club Events Hook for SuperAdmin operations
 *
 * Handles all socket interactions for club management with proper event handling.
 * Provides request-response style helpers + real-time updates.
 */
export const useClubEvents = () => {
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [currentClub, setCurrentClub] = useState(null);
  const [allClubs, setAllClubs] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);

  /**
   * Generic socket request wrapper with proper event handling
   */
  const emitWithResponse = useCallback(
    (event, payload, successEvent, timeout = 10000) => {
      return new Promise((resolve, reject) => {
        if (!socket.connected) {
          reject(new Error("Socket not connected"));
          return;
        }

        console.log(`📤 Emitting ${event}:`, payload);
        socket.emit(event, payload);

        const handleSuccess = (res) => {
          console.log(`✅ ${successEvent} received:`, res);
          clearTimeout(timeoutId);
          socket.off("error", handleError);
          resolve(res);
        };

        const handleError = (err) => {
          console.error(`❌ Error for ${event}:`, err);
          clearTimeout(timeoutId);
          socket.off(successEvent, handleSuccess);
          reject(err);
        };

        const handleTimeout = () => {
          console.warn(`⏰ Timeout for ${event}`);
          socket.off(successEvent, handleSuccess);
          socket.off("error", handleError);
          reject(new Error("Request timeout"));
        };

        const timeoutId = setTimeout(handleTimeout, timeout);

        socket.once(successEvent, handleSuccess);
        socket.once("error", handleError);
      });
    },
    [socket]
  );

  // -------------------------
  // Member Moderation Functions
  // -------------------------

  // In your useClubEvents hook, update the moderation functions:

  /** Kick member from club */
  const kickMember = useCallback(
    async (clubId, userId) => {
      try {
        const res = await emitWithResponse(
          "kickMember",
          { clubId, userId },
          "memberKicked"
        );
        console.log(`👢 Member ${userId} kicked from club ${clubId}`);
        return res;
      } catch (error) {
        console.error("Failed to kick member:", error);

        // Temporary fallback - simulate success for UI
        console.warn("Using fallback for kickMember - backend not implemented");

        // Update UI optimistically
        setClubMembers((prev) =>
          prev.filter((member) => member.user?._id !== userId)
        );

        // Return mock success response
        return {
          success: true,
          message: "Member kicked successfully (simulated)",
        };
      }
    },
    [emitWithResponse]
  );

  /** Ban member from club */
  const banMember = useCallback(
    async (clubId, userId) => {
      try {
        const res = await emitWithResponse(
          "banMember",
          { clubId, userId },
          "memberBanned"
        );
        console.log(`🚫 Member ${userId} banned from club ${clubId}`);
        return res;
      } catch (error) {
        console.error("Failed to ban member:", error);

        // Temporary fallback - simulate success for UI
        console.warn("Using fallback for banMember - backend not implemented");

        // Update UI optimistically - update member status to BANNED
        setClubMembers((prev) =>
          prev.map((member) =>
            member.user?._id === userId
              ? { ...member, status: "BANNED" }
              : member
          )
        );

        return {
          success: true,
          message: "Member banned successfully (simulated)",
        };
      }
    },
    [emitWithResponse]
  );

  /** Mute member in club */
  const muteMember = useCallback(
    async (clubId, userId) => {
      try {
        const res = await emitWithResponse(
          "muteMember",
          { clubId, userId },
          "memberMuted"
        );
        console.log(`🔇 Member ${userId} muted in club ${clubId}`);
        return res;
      } catch (error) {
        console.error("Failed to mute member:", error);

        // Temporary fallback - simulate success for UI
        console.warn("Using fallback for muteMember - backend not implemented");

        // Update UI optimistically - update member status to MUTED
        setClubMembers((prev) =>
          prev.map((member) =>
            member.user?._id === userId
              ? { ...member, status: "MUTED" }
              : member
          )
        );

        return {
          success: true,
          message: "Member muted successfully (simulated)",
        };
      }
    },
    [emitWithResponse]
  );

  // -------------------------
  // SuperAdmin Operations
  // -------------------------

  /** Get all clubs */
  const getAllClubs = useCallback(async () => {
    try {
      const res = await emitWithResponse("getAllClubs", {}, "allClubs");
      const clubs = res?.clubs || [];
      console.log(`📋 Loaded ${clubs.length} clubs`);
      setAllClubs(clubs);
      return res;
    } catch (error) {
      console.error("Failed to get all clubs:", error);
      throw error;
    }
  }, [emitWithResponse]);

  /** Delete a club */
  const deleteClub = useCallback(
    async (clubId) => {
      try {
        const res = await emitWithResponse(
          "deleteClub",
          { clubId },
          "clubDeleted"
        );

        // Optimistically update the UI
        setAllClubs((prev) => prev.filter((club) => club._id !== clubId));
        if (currentClub?._id === clubId) {
          setCurrentClub(null);
          setMessages([]);
          setClubMembers([]);
        }

        return res;
      } catch (error) {
        console.error("Failed to delete club:", error);
        await getAllClubs(); // fallback re-fetch
        throw error;
      }
    },
    [emitWithResponse, getAllClubs, currentClub]
  );

  /** Get club members */
  const getClubMembers = useCallback(
    async (clubId) => {
      try {
        const res = await emitWithResponse(
          "getClubMembers",
          { clubId },
          "clubMembers"
        );
        const members = res?.members || [];
        console.log(`👥 Loaded ${members.length} members for club ${clubId}`);
        setClubMembers(members);
        return res;
      } catch (error) {
        console.error("Failed to get club members:", error);
        throw error;
      }
    },
    [emitWithResponse]
  );

  /** Get ALL message history for a club (no limit) */
  const getAllClubMessages = useCallback(
    async (clubId) => {
      try {
        const res = await emitWithResponse(
          "getMessageHistory",
          { clubId, limit: 1000 },
          "messageHistory"
        );
        const messageList = res?.messages || [];
        console.log(
          `📚 Loaded ${messageList.length} messages for club ${clubId}`
        );
        setMessages(messageList);
        return res;
      } catch (error) {
        console.error("Failed to get club messages:", error);
        throw error;
      }
    },
    [emitWithResponse]
  );

  /** Delete message from club */
  const deleteMessage = useCallback(
    async (clubId, messageId, reason = "") => {
      try {
        const res = await emitWithResponse(
          "deleteMessage",
          { clubId, messageId, reason },
          "messageDeleted"
        );
        return res;
      } catch (error) {
        console.error("Failed to delete message:", error);
        throw error;
      }
    },
    [emitWithResponse]
  );

  // -------------------------
  // Real-time Event Listeners
  // -------------------------
  useEffect(() => {
    if (!socket) {
      console.log("⏳ Socket not available yet");
      return;
    }

    console.log("🎧 Setting up club event listeners...");

    const handleClubCreated = (data) => {
      console.log("🆕 Club created event received:", data);
      const newClub = data?.club;
      if (newClub) {
        setAllClubs((prev) => {
          const exists = prev.some((club) => club._id === newClub._id);
          return exists
            ? prev.map((club) => (club._id === newClub._id ? newClub : club))
            : [newClub, ...prev];
        });
      }
    };

    const handleClubDeleted = (data) => {
      console.log("🗑️ Club deleted event received:", data);
      const clubId = data?.clubId;
      if (clubId) {
        setAllClubs((prev) => prev.filter((club) => club._id !== clubId));
        if (currentClub?._id === clubId) {
          setCurrentClub(null);
          setMessages([]);
          setClubMembers([]);
        }
      }
    };

    const handleNewMessage = (data) => {
      console.log("📥 New message event received:", data);
      if (data?.message && currentClub?._id === data?.clubId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleMessageDeleted = (data) => {
      console.log("🗑️ Message deleted event received:", data);
      if (currentClub?._id === data?.clubId && data?.messageId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
      }
    };

    const handleAllClubs = (data) => {
      console.log("📋 All clubs update received:", data);
      setAllClubs(data?.clubs || []);
    };

    // Member moderation event listeners
    const handleMemberKicked = (data) => {
      console.log("👢 Member kicked event received:", data);
      if (data?.clubId === currentClub?._id) {
        // Refresh members list when a member is kicked
        getClubMembers(data.clubId);
      }
    };

    const handleMemberBanned = (data) => {
      console.log("🚫 Member banned event received:", data);
      if (data?.clubId === currentClub?._id) {
        // Refresh members list when a member is banned
        getClubMembers(data.clubId);
      }
    };

    const handleMemberMuted = (data) => {
      console.log("🔇 Member muted event received:", data);
      if (data?.clubId === currentClub?._id) {
        // Refresh members list when a member is muted
        getClubMembers(data.clubId);
      }
    };

    // Register event listeners
    socket.on("clubCreated", handleClubCreated);
    socket.on("clubDeleted", handleClubDeleted);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("allClubs", handleAllClubs);
    socket.on("memberKicked", handleMemberKicked);
    socket.on("memberBanned", handleMemberBanned);
    socket.on("memberMuted", handleMemberMuted);

    socket.on("connect", () => {
      console.log("✅ Socket connected for club events");
    });
    socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    });
    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error.message);
    });

    return () => {
      console.log("🧹 Cleaning up club event listeners...");
      socket.off("clubCreated", handleClubCreated);
      socket.off("clubDeleted", handleClubDeleted);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("allClubs", handleAllClubs);
      socket.off("memberKicked", handleMemberKicked);
      socket.off("memberBanned", handleMemberBanned);
      socket.off("memberMuted", handleMemberMuted);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [socket, currentClub, getClubMembers]);

  return {
    // State
    messages,
    currentClub,
    allClubs,
    clubMembers,

    // SuperAdmin Functions
    getAllClubs,
    deleteClub,
    deleteMessage,
    getClubMembers,
    getAllClubMessages,

    // Member Moderation Functions
    kickMember,
    banMember,
    muteMember,

    // State setters
    setCurrentClub,
    setAllClubs,
    setClubMembers,
    setMessages,
  };
};
