/**
 * UserDetails Component
 *
 * Displays detailed information about a single user.
 * Features include:
 * - User profile (picture, name, UID)
 * - Contact information (email, phone)
 * - Account info (role, status, verification)
 * - Coins, referral code, invites count
 * - Bio and gender
 * - Social stats (followers, following, blocked users, warnings)
 * - Media gallery (with placeholder if empty)
 * - Account creation and last login info
 *
 * @component
 * @example
 * return (
 *   <UserDetails />
 * )
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "../../../styles/global.styles.css";
import "./User.details.css";

const UserDetails = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user from route state
    setTimeout(() => {
      setUser(location.state?.user || null);
      setLoading(false);
    }, 800);
  }, [location.state]);

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section id="user-detail">
      <h2 className="users-title">User Details</h2>

      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : !user ? (
        <div className="not-found">No User Found</div>
      ) : (
        <div className="content-container">
          {/* User Profile Picture */}
          <div className="user-image-container">
            <img
              src={user.profilePicture || "/default-user.png"}
              alt={user.userName}
              className="user-image"
              onError={(e) => (e.target.src = "/default-user.png")}
            />
          </div>

          {/* User Details */}
          <div className="details-container">
            <div className="details-table">
              <div className="detail-row">
                <div className="detail-label">UID</div>
                <div className="detail-value">#{user._id.slice(0, 8)}</div>
                <div className="detail-label">Username</div>
                <div className="detail-value">{user.userName}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Email</div>
                <div className="detail-value">{user.email}</div>
                <div className="detail-label">Phone</div>
                <div className="detail-value">{user.phone}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Role</div>
                <div className="detail-value">{user.role}</div>
                <div className="detail-label">Status</div>
                <div className="detail-value">{user.status}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Verified</div>
                <div className="detail-value">
                  {user.isVerified ? "Yes" : "No"}
                </div>
                <div className="detail-label">Coins</div>
                <div className="detail-value">{user.coins || 0}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Referral Code</div>
                <div className="detail-value">{user.referralCode || "-"}</div>
                <div className="detail-label">Invites Count</div>
                <div className="detail-value">{user.invitesCount || 0}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Gender</div>
                <div className="detail-value">{user.gender}</div>
                <div className="detail-label">Bio</div>
                <div className="detail-value description">
                  {user.bio || "-"}
                </div>
              </div>

              {/* Social Stats */}
              <div className="detail-row">
                <div className="detail-label">Followers</div>
                <div className="detail-value">
                  {user.followers?.length || 0}
                </div>
                <div className="detail-label">Following</div>
                <div className="detail-value">
                  {user.following?.length || 0}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Blocked Users</div>
                <div className="detail-value">
                  {user.blockedUsers?.length || 0}
                </div>
                <div className="detail-label">Warnings</div>
                <div className="detail-value">{user.warnings?.length || 0}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Created At</div>
                <div className="detail-value">{formatDate(user.createdAt)}</div>
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{formatDate(user.lastLogin)}</div>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="media-gallery">
              <h3>Media</h3>
              {user.media && user.media.length > 0 ? (
                <div className="media-grid">
                  {user.media.map((m) => (
                    <img
                      key={m._id}
                      src={m.url}
                      alt="User Media"
                      className="media-item"
                    />
                  ))}
                </div>
              ) : (
                <p className="no-media">No media uploaded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserDetails;
