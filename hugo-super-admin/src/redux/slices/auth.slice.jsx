/**
 * Authentication Slice
 *
 * Manages authentication state for the Super Admin, including
 * registration, login, and logout flows.
 *
 * Features:
 * - Login: Authenticates an existing Super Admin
 * - Forgot Password: Send Email Notification For Password Reset
 * - Reset Password: To Reset Admin Password
 * - Logout: Ends the current session
 *
 * State Shape:
 * {
 * user: { id, email, userName } | null,
 * token: string | null,
 * loading: boolean,
 * error: any
 * }
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

/**
 * Login an existing Super Admin.
 *
 * @param {Object} loginData - Login credentials.
 * @returns {Promise<{ user: Object, token: string }>} User info and JWT token.
 */
export const login = createAsyncThunk(
  "super-admin/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/signin-super-admin`,
        loginData
      );

      const { token, superAdmin, message, success } = response.data;

      if (!success || !superAdmin || !token) {
        throw new Error("Invalid login response format");
      }

      const user = {
        id: superAdmin.id,
        email: superAdmin.email,
        userName: superAdmin.userName,
      };

      localStorage.setItem("authToken", token);

      return { user, token, message };
    } catch (error) {
      // Keep console.error for debugging errors
      // console.error("Login Error:", error.response?.data || error.message);

      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message || "Login failed",
          success: backendError.success || false,
          attempts: backendError.attempts,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message || "Network error occurred",
        success: false,
        status: 0,
      });
    }
  }
);

/**
 * Send forgot password email to Super Admin.
 *
 * @param {Object} emailData - Email address for password reset.
 * @returns {Promise<{ message: string }>} Success message.
 */
export const forgotPassword = createAsyncThunk(
  "super-admin/forgot-password",
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/forgot-password`,
        emailData
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error("Invalid forgot password response format");
      }

      return { message };
    } catch (error) {
      // Keep console.error for debugging errors
      // console.error(
      //   "Forgot Password Error:",
      //   error.response?.data || error.message
      // );

      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message || "Password reset failed",
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message || "Network error occurred",
        success: false,
        status: 0,
      });
    }
  }
);

/**
 * Reset password for Super Admin using reset token.
 *
 * @param {Object} resetData - New password and reset token.
 * @returns {Promise<{ message: string }>} Success message.
 */
export const resetPassword = createAsyncThunk(
  "super-admin/reset-password",
  async (resetData, { rejectWithValue }) => {
    try {
      const { newPassword, token } = resetData;

      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/reset-password/${token}`,
        { newPassword }
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error("Invalid reset password response format");
      }

      return { message };
    } catch (error) {
      // Keep console.error for debugging errors
      // console.error(
      //   "Reset Password Error:",
      //   error.response?.data || error.message
      // );

      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message || "Password reset failed",
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message || "Network error occurred",
        success: false,
        status: 0,
      });
    }
  }
);

/**
 * Logout the current Super Admin.
 *
 * @returns {Promise<any>} API response data.
 */
export const logout = createAsyncThunk(
  "super-admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/logout-super-admin`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove the token from localStorage here, regardless of API response success,
      // as the client session should end on a successful logout request.
      localStorage.removeItem("authToken");

      const message = response.data?.message;
      return { message, ...response.data };
    } catch (error) {
      // Even on error, clear the client-side token for security if the server-side
      // session is questionable or if the token is invalid.
      localStorage.removeItem("authToken");

      const errorMessage =
        error.response?.data?.message || "Unknown error occurred";

      return rejectWithValue({
        message: errorMessage,
        ...error.response?.data,
      });
    }
  }
);

/**
 * Auth slice managing user and token state with async thunks.
 */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    // A utility reducer to check and restore session from localStorage if needed
    // This is a common pattern but not strictly required by the prompt.
    // checkAuth: (state) => {
    //   const token = localStorage.getItem("authToken");
    //   if (token && !state.token) {
    //     // You'd typically need a separate thunk or logic to decode/validate the token
    //     // and fetch user data, but for basic state, you can set the token.
    //     state.token = token;
    //     // state.user would remain null until a refresh/fetch is performed
    //   }
    // }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Clear local storage token on login failure in case of stale/invalid token
        localStorage.removeItem("authToken");
        state.user = null;
        state.token = null;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        // Forgot password success - no state changes needed
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        // Reset password success - no state changes needed
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous error
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        // The token is already removed in the thunk for robustness, but we still update state
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // The token is already removed in the thunk's catch block for robustness, but we still update state
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;
