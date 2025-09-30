import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../styles/global.styles.css";
import "./Sidebar.utility.css";

const Sidebar = () => {
  const location = useLocation();

  // Active states
  const isUsersActive = location.pathname.startsWith("/super-admin/users");
  const isCoinPackagesActive = location.pathname.startsWith(
    "/super-admin/coin-packages"
  );
  const isTransactionsActive = location.pathname.startsWith(
    "/super-admin/transactions"
  );
  const isClubsActive = location.pathname.startsWith("/super-admin/clubs");

  useEffect(() => {
    const links = document.querySelectorAll(".sidebar-link");

    const showTooltip = (event) => {
      const link = event.currentTarget;
      const label = link.getAttribute("data-label");

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

    const hideTooltip = () => {
      const tooltip = document.querySelector(".tooltip-custom");
      if (tooltip) {
        tooltip.style.opacity = "0";
      }
    };

    links.forEach((link) => {
      link.addEventListener("mouseenter", showTooltip);
      link.addEventListener("mouseleave", hideTooltip);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("mouseenter", showTooltip);
        link.removeEventListener("mouseleave", hideTooltip);
      });
    };
  }, []);

  return (
    <section id="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-container">
          {/* Dashboard */}
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

          {/* Users */}
          <NavLink
            to="/super-admin/users/manage-users"
            className={`sidebar-link ${isUsersActive ? "active" : ""}`}
            data-label="Users"
          >
            <div className="sidebar-icon">
              <i className="fas fa-users"></i>
            </div>
            <span className="sidebar-text">Users</span>
          </NavLink>

          {/* Coin Packages */}
          <NavLink
            to="/super-admin/coin-packages/manage-coin-packages"
            className={`sidebar-link ${isCoinPackagesActive ? "active" : ""}`}
            data-label="Coin Packages"
          >
            <div className="sidebar-icon">
              <i className="fas fa-box-open"></i>
            </div>
            <span className="sidebar-text">Coin Packages</span>
          </NavLink>

          {/* Transactions */}
          <NavLink
            to="/super-admin/transactions/manage-transactions"
            className={`sidebar-link ${isTransactionsActive ? "active" : ""}`}
            data-label="Transactions"
          >
            <div className="sidebar-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <span className="sidebar-text">Transactions</span>
          </NavLink>

          {/* Clubs (fixed) */}
          <NavLink
            to="/super-admin/clubs/manage-clubs"
            className={`sidebar-link ${isClubsActive ? "active" : ""}`}
            data-label="Clubs"
          >
            <div className="sidebar-icon">
              <i className="fas fa-building"></i>
            </div>
            <span className="sidebar-text">Clubs</span>
          </NavLink>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
