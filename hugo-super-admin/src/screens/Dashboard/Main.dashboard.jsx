/**
 * Dashboard Component (Users + Packages + Transactions)
 *
 * Provides an overview of key statistics including:
 * - Users: total, active, suspended, banned
 * - Packages: total, active
 * - Transactions: total, by status (pending review, success, rejected, failed)
 *
 * Features:
 * - Fetches data from Redux slices (users, packages, transactions)
 * - Displays interactive statistic cards with icons
 * - Allows navigation to management pages
 *
 * @component
 * @example
 * return <Dashboard />
 *
 * @returns {JSX.Element} A dashboard overview with user, package & transaction statistics
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utilities/Card/Card.utility";
import { getUsers } from "../../redux/slices/user.slice";
import { getPackages } from "../../redux/slices/package.slice";
import { getAllTransactions } from "../../redux/slices/transaction.slice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.users.users || []);
  const packages = useSelector((state) => state.packages.packages || []);
  const transactions = useSelector(
    (state) => state.transactions.transactions || []
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(getUsers());
      dispatch(getPackages());
      dispatch(getAllTransactions());
    }
  }, [dispatch, user?.id]);

  // ======================
  // User statistics
  // ======================
  const { totalUsers, activeUsers, suspendedUsers, bannedUsers } = users.reduce(
    (acc, usr) => {
      acc.totalUsers++;
      if (usr.status === "ACTIVE") acc.activeUsers++;
      if (usr.status === "SUSPENDED") acc.suspendedUsers++;
      if (usr.status === "BANNED") acc.bannedUsers++;
      return acc;
    },
    {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      bannedUsers: 0,
    }
  );

  // ======================
  // Package statistics
  // ======================
  const { totalPackages, activePackages } = packages.reduce(
    (acc, pkg) => {
      acc.totalPackages++;
      if (pkg.isActive === true) acc.activePackages++;
      return acc;
    },
    { totalPackages: 0, activePackages: 0 }
  );

  // ======================
  // Transaction statistics
  // ======================
  const { totalTransactions, pending, success, rejected, failed } =
    transactions.reduce(
      (acc, tx) => {
        acc.totalTransactions++;
        switch (tx.status) {
          case "PENDING_REVIEW":
            acc.pending++;
            break;
          case "SUCCESS":
            acc.success++;
            break;
          case "REJECTED":
            acc.rejected++;
            break;
          case "FAILED":
            acc.failed++;
            break;
          default:
            break;
        }
        return acc;
      },
      {
        totalTransactions: 0,
        pending: 0,
        success: 0,
        rejected: 0,
        failed: 0,
      }
    );

  // ======================
  // Navigation handler
  // ======================
  const handleNavigate = (path) => navigate(path);

  return (
    <section id="dashboard" style={{ marginTop: 15 }}>
      <div className="container-fluid">
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--primary)",
            margin: 0,
            paddingLeft: "10px",
            borderLeft: "4px solid var(--primary)",
            marginBottom: "40px",
          }}
        >
          Dashboard Overview
        </h2>

        <div className="row g-2 mb-2">
          {/* Users Statistic Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() => handleNavigate("/super-admin/users/manage-users")}
              title="Users"
              icon={
                <i
                  className="fas fa-users fa-shake text-primary"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalUsers },
                { label: "Active", value: activeUsers },
                { label: "Suspended", value: suspendedUsers },
                { label: "Banned", value: bannedUsers },
              ]}
              gradientType="ocean"
            />
          </div>

          {/* Packages Statistic Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate(
                  "/super-admin/coin-packages/manage-coin-packages"
                )
              }
              title="Coin Packages"
              icon={
                <i
                  className="fas fa-box-open fa-bounce text-success"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalPackages },
                { label: "Active", value: activePackages },
              ]}
              gradientType="emerald"
            />
          </div>

          {/* Transactions Statistic Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate("/super-admin/transactions/manage-transactions")
              }
              title="Transactions"
              icon={
                <i
                  className="fas fa-receipt fa-fade text-warning"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalTransactions },
                { label: "Pending", value: pending },
                { label: "Approved", value: success },
                { label: "Rejected", value: rejected },
              ]}
              gradientType="sunset"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
