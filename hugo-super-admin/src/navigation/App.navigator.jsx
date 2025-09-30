/**
 * App Navigator
 *
 * Defines the routing structure of the application using React Router.
 * It organizes public and protected routes, ensuring that only
 * authenticated users can access admin-related screens.
 *
 * Structure:
 * - Public Routes:
 *     Signin
 *     Forgot Password
 *     Reset Password
 * - Protected Routes: Wrapped with ProtectedRoute and DashboardLayout
 *   - Dashboard
 * - Fallback: 404 Not Found page
 */

import { Routes, Route } from "react-router-dom";

// Authentication
import Signin from "../screens/auth/Signin/Signin.auth";
import ForgotPassword from "../screens/auth/Forgot-password/ForgotPassword.auth";
import ResetPassword from "../screens/auth/Reset-password/ResetPassword.auth";

// DashboardLayout + ProtectedRoutes
import DashboardLayout from "./outlet/Outlet.outlet";
import ProtectedRoute from "./protected-routes/Protected.routes";

// Dashboard
import Dashboard from "../screens/Dashboard/Main.dashboard";

// Users
import ManageUsers from "../screens/Users/Manage-Users/Users";
import UserDetails from "../screens/Users/User-Details/User.details";

// Coin Packages
import ManageCoinPackage from "../screens/Coin-Packages/Manage-Packages/Coin.package";
import AddCoinPackage from "../screens/Coin-Packages/Add-Packages/Add.Coin.package";
import UpdateCoinPackage from "../screens/Coin-Packages/Update-Package/Update.Coin.package";

// Transactions
import ManageTransaction from "../screens/Transactions/Manage-Transactions/Transactions";

// Clubs
import ManageClubs from "../screens/Clubs/Manage-Clubs/Clubs";

// Not Found
import NotFound from "../screens/Not-found/Not-Found";
import ClubDetails from "../screens/Clubs/Club-Details/Club.details";

/**
 * Application routing configuration.
 *
 * @returns {JSX.Element} The route definitions for the app.
 */
const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />
      <Route path="/super-admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/super-admin/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Make dashboard the index route for /admin */}
        <Route index element={<Dashboard />} />

        {/* Dashboard Routes */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* User Management Routes */}
        <Route path="users/manage-users" element={<ManageUsers />} />
        <Route path="users/user-details/:id" element={<UserDetails />} />

        {/* Coin Package Management Routes */}
        <Route
          path="coin-packages/manage-coin-packages"
          element={<ManageCoinPackage />}
        />
        <Route
          path="coin-packages/add-coin-packages"
          element={<AddCoinPackage />}
        />
        <Route
          path="coin-packages/update-coin-package/:id"
          element={<UpdateCoinPackage />}
        />

        {/* Transaction Management Routes */}
        <Route
          path="transactions/manage-transactions"
          element={<ManageTransaction />}
        />

        {/* Clubs Management Routes */}
        <Route path="clubs/manage-clubs" element={<ManageClubs />} />
        <Route path="clubs/club-details/:id" element={<ClubDetails />} />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
