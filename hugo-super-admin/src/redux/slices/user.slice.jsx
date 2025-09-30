/**
 * User Slice (Super Admin)
 *
 * Manages user-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all users
 * - Update user status (active/suspended/banned)
 * - Delete users
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   users: Array<Object>,   // List of users
 *   loading: boolean,       // Loading indicator for async actions
 *   error: string | null    // Error message from API calls
 * }
 *
 * @module userSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all users.
 */
export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/get-all-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Assuming the API returns an object with an 'allUsers' key containing the array
      return response.data.allUsers;
    } catch (error) {
      // Standardized error payload
      return rejectWithValue(
        error.response?.data || "An error occurred while fetching users."
      );
    }
  }
);

/**
 * Update user status (active/suspended/banned)
 */
export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async ({ userId, status, adminNotes = "" }, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.patch(
        `${BACKEND_API_URL}/super-admin/user/update-user-status/${userId}`,
        {
          status,
          adminNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data; // Should return { success: true, message: string, user: updatedUser }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "An error occurred while updating user status."
      );
    }
  }
);

/**
 * Delete user
 */
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/super-admin/delete-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data; // Should return { success: true, message: string, deletedUserId: userId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "An error occurred while deleting user."
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: You can keep this if you need to manually update users for optimistic updates
    updateUserInState: (state, action) => {
      const { userId, updates } = action.payload;
      const userIndex = state.users.findIndex((user) => user._id === userId);
      if (userIndex !== -1) {
        state.users[userIndex] = { ...state.users[userIndex], ...updates };
      }
    },
    // Optional: Remove user from state for optimistic deletion
    removeUserFromState: (state, action) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific user in the state with the returned user data
        const updatedUser = action.payload.user;
        if (updatedUser) {
          const userIndex = state.users.findIndex(
            (user) => user._id === updatedUser._id
          );
          if (userIndex !== -1) {
            state.users[userIndex] = updatedUser;
          }
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted user from state
        const deletedUserId = action.payload.deletedUserId;
        if (deletedUserId) {
          state.users = state.users.filter(
            (user) => user._id !== deletedUserId
          );
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateUserInState, removeUserFromState } = userSlice.actions;

export default userSlice.reducer;
