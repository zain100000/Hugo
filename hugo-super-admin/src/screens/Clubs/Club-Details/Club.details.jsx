/**
 * ClubDetails Component
 *
 * Displays detailed information about a single club.
 * Features include:
 * - Club logo, name, CID
 * - Description, rules, tags
 * - Owner/admin details
 * - Public/Private status, active status, max members
 * - Members list with role, status, joined date
 * - Created and updated timestamps
 *
 * @component
 * @example
 * return (
 *   <ClubDetails />
 * )
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";
import "../../../styles/global.styles.css";
import "./Club.details.css";
import ClubImage from "../../../assets/placeHolders/club-placeholder.png";

const ClubDetails = () => {
  const location = useLocation();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch from route state
    setTimeout(() => {
      setClub(location.state?.club || null);
      setLoading(false);
    }, 800);
  }, [location.state]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section id="club-detail">
      <h2 className="clubs-title">Club Details</h2>

      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : !club ? (
        <div className="not-found">No Club Found</div>
      ) : (
        <div className="content-container">
          {/* Club Image */}
          <div className="club-image-container">
            <img
              src={club.clubImage || ClubImage}
              alt={club.name}
              className="club-image"
              onError={(e) => (e.target.src = ClubImage)}
            />
          </div>
          {/* Club Details */}
          <div className="details-container">
            <div className="details-table">
              <div className="detail-row">
                <div className="detail-label">CID</div>
                <div className="detail-value">#{club._id.slice(0, 8)}</div>
                <div className="detail-label">Name</div>
                <div className="detail-value">{club.name}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Description</div>
                <div className="detail-value description">
                  {club.description || "-"}
                </div>
                <div className="detail-label">Rules</div>
                <div className="detail-value description">
                  {club.rules || "-"}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Admin</div>
                <div className="detail-value">
                  {club.admin?.userName || "-"}
                </div>
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  {club.isActive ? "Active ✅" : "Inactive ❌"}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Visibility</div>
                <div className="detail-value">
                  {club.isPublic ? "Public" : "Private"}
                </div>
                <div className="detail-label">Max Members</div>
                <div className="detail-value">{club.maxMembers || 0}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Tags</div>
                <div className="detail-value">
                  {club.tags?.length ? club.tags.join(", ") : "-"}
                </div>
                <div className="detail-label">Members Count</div>
                <div className="detail-value">{club.members?.length || 0}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Created At</div>
                <div className="detail-value">{formatDate(club.createdAt)}</div>
                <div className="detail-label">Updated At</div>
                <div className="detail-value">{formatDate(club.updatedAt)}</div>
              </div>
            </div>

            {/* Members Section */}
            <div className="members-section">
              <h3>Members</h3>
              {club.members?.length ? (
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>UID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {club.members.map((m) => {
                      const userObject = m.user;

                      // Extract UID
                      const uid =
                        userObject && typeof userObject === "object"
                          ? userObject._id
                            ? userObject._id.toString()
                            : userObject.$oid
                            ? userObject.$oid
                            : "N/A"
                          : userObject || "N/A";

                      // Extract Name if available
                      const name = userObject?.userName || "-";

                      // Extract joined date
                      const joined =
                        m.joinedAt && m.joinedAt.$date
                          ? m.joinedAt.$date
                          : m.joinedAt;

                      return (
                        <tr key={m._id?.$oid || m._id || uid}>
                          <td>#{uid.slice(0, 8)}</td>
                          <td>{name}</td>
                          <td>{m.role || "-"}</td>
                          <td>{m.status || "-"}</td>
                          <td>
                            {joined
                              ? new Date(joined).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="no-members">No members yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClubDetails;
