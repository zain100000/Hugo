/**
 * @file Header.utility.jsx
 * @description
 * The Header component provides the main navigation bar for the LibrisVault admin dashboard.
 * It includes:
 * - Branding/logo section with navigation to the dashboard
 * - User profile section with avatar, welcome text, and logout button
 * - Responsive layout using Bootstrap 5 grid and utility classes
 * - Glassmorphism with animated gradient background
 *
 * Features:
 * - Fetches and displays super admin data (username & profile picture)
 * - Logout functionality with success/error toast notifications
 * - Mobile-first responsive design
 *
 * Dependencies:
 * - React, Redux Toolkit, React Router DOM
 * - toast from react-hot-toast
 * - Custom Button utility component
 * - Global styles and Header-specific styles
 *
 * @module Header
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/auth.slice";
import { getSuperAdmin } from "../../redux/slices/super-admin.slice";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo/logo.png";
import imgPlaceholder from "../../assets/placeholders/img-placeholder.png";
import Button from "../Button/Button.utility";
import "../../styles/global.styles.css";
import "./Header.utility.css";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const superAdmin = useSelector((state) => state.superAdmin.superAdmin);
  const profilePicture = superAdmin?.profilePicture || imgPlaceholder;
  const userName = superAdmin?.userName || user?.userName || "Admin";

  useEffect(() => {
    if (user?.id) {
      dispatch(getSuperAdmin(user.id));
    }
  }, [dispatch, user?.id]);

  /**
   * Handles user logout process
   */
  const handleLogout = async () => {
    setLoading(true);
    try {
      const resultAction = await dispatch(logout());
      if (logout.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload?.message || "Logout successful";
        toast.success(successMessage);
        setTimeout(() => navigate("/"), 1500);
      } else if (logout.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload?.message || "Logout failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred during logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header id="header" className="shadow-sm">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          {/* Logo Section */}
          <div className="col-auto d-flex align-items-center logo">
            <img src={Logo} alt="Destined Logo" className="logo-img" />
          </div>

          {/* Profile + Nav Section */}
          <div className="col-auto profile-section d-flex align-items-center">
            <span className="welcome-text me-3">Hi, {userName}</span>

            <Button
              className="logout-btn me-3"
              onPress={handleLogout}
              loading={loading}
              title="Logout"
              icon={<i className="fas fa-sign-out-alt"></i>}
              variant="danger"
              size="small"
            />

            <img src={profilePicture} alt="Profile" className="profile-img" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
