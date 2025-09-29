/**
 * Dashboard Layout
 *
 * Provides the main layout structure for authenticated dashboard pages.
 * It includes:
 * - A persistent Header at the top
 * - A Sidebar for navigation
 * - A main content area where nested routes are rendered via React Router's Outlet
 *
 * This layout ensures a consistent structure across all admin dashboard screens.
 */

import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.layout.css";
import Header from "../../utilities/Header/Header.utility";
import Sidebar from "../../utilities/Sidebar/Sidebar.utility";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // default open on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Header onMenuClick={toggleSidebar} />
      <div className="dashboard-container">
        <aside
          className={`sidebar-container ${sidebarOpen ? "sidebar-open" : ""} ${
            isMobile ? "sidebar-mobile" : ""
          }`}
        >
          <Sidebar />
        </aside>

        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}

        <main
          className="content"
          onClick={closeSidebar}
          style={{
            marginLeft:
              !isMobile && sidebarOpen ? "var(--sidebar-width, 250px)" : 0,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
