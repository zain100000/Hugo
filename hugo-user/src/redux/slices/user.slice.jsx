/**
 * Redux slice for user profile management
 * Handles fetching, updating, and deleting user data
 * Includes comprehensive error handling and backend message propagation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated.');
    return token;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch token.');
  }
};

/**
 * Fetch user details by ID
 * @param {string} userId - The user's unique identifier
 * @returns {Object} Success status, message, and user data from backend
 */
export const getUser = createAsyncThunk(
  'user/getUser',
  async (userId, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BASE_URL}/user/get-user-by-id/${userId}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const {success, message, user} = response.data;
      return {success, message, user};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch user.';
      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

/**
 * Update user profile details
 * @param {Object} params - Contains userId and formData
 * @returns {Object} Success status, message, and updated user data from backend
 */
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({userId, formData}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.patch(
        `${BASE_URL}/user/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const {success, message, user} = response.data;
      return {success, message, user};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update user.';
      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

/**
 * Delete user account
 * @param {string} userId - The user's unique identifier
 * @returns {Object} Success status and message from backend
 */
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.delete(
        `${BASE_URL}/user/delete-user-account/${userId}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const {success, message} = response.data;
      await AsyncStorage.removeItem('authToken');
      return {success, message};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete user.';
      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
    message: null,
    backendMessage: null,
  },
  reducers: {
    clearUser: state => {
      state.user = null;
      state.error = null;
      state.message = null;
      state.backendMessage = null;
    },
    clearError: state => {
      state.error = null;
      state.backendMessage = null;
    },
    clearMessage: state => {
      state.message = null;
      state.backendMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(deleteUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      });
  },
});

export const {clearUser, clearError, clearMessage} = userSlice.actions;
export default userSlice.reducer;
