/**
 * Sidebar Component
 *
 * Provides a fixed navigation menu for the admin dashboard.
 * Uses `NavLink` for route navigation with active highlighting.
 * The current route is tracked using `useLocation` to apply "active" styling
 * to grouped navigation links (e.g., all `/admin/products/*` routes).
 *
 * @component
 * @example
 * return (
 *   <Sidebar />
 * )
 */

import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../styles/global.styles.css";
import "./Sidebar.utility.css";

const Sidebar = () => {
  const location = useLocation();

  useEffect(() => {
    // Select all sidebar links
    const links = document.querySelectorAll(".sidebar-link");

    // Function to show the tooltip
    const showTooltip = (event) => {
      const link = event.currentTarget;
      const label = link.getAttribute("data-label");

      // Check if tooltip is needed (e.g., on small screens)
      if (label && window.innerWidth <= 992) {
        let tooltip = document.querySelector(".tooltip-custom");
        if (!tooltip) {
          tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-custom");
          document.body.appendChild(tooltip);
        }

        tooltip.textContent = label;
        const rect = link.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 12}px`;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.opacity = "1";
      }
    };

    // Function to hide the tooltip
    const hideTooltip = () => {
      const tooltip = document.querySelector(".tooltip-custom");
      if (tooltip) {
        tooltip.style.opacity = "0";
      }
    };

    // Add event listeners to each link
    links.forEach((link) => {
      link.addEventListener("mouseenter", showTooltip);
      link.addEventListener("mouseleave", hideTooltip);
    });

    // Clean up event listeners on component unmount
    return () => {
      links.forEach((link) => {
        link.removeEventListener("mouseenter", showTooltip);
        link.removeEventListener("mouseleave", hideTooltip);
      });
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <section id="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-container">
          <NavLink
            to="/super-admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            data-label="Dashboard"
          >
            <div className="sidebar-icon">
              <i className="fas fa-home"></i>
            </div>
            <span className="sidebar-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/super-admin/users"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            data-label="Users"
          >
            <div className="sidebar-icon">
              <i className="fas fa-users"></i>
            </div>
            <span className="sidebar-text">Users</span>
          </NavLink>

          <NavLink
            to="/super-admin/messages"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            data-label="Messages"
          >
            <div className="sidebar-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <span className="sidebar-text">Messages</span>
          </NavLink>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
