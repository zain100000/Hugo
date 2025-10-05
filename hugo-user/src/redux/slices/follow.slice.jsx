/**
 * Redux slice for managing user follow/unfollow actions
 * Handles authenticated user interactions with other users
 * Uses AsyncStorage for token handling (React Native)
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

/**
 * Follow a user
 * @param {string} targetUserId - ID of the user to follow
 */
export const followUser = createAsyncThunk(
  'follow/followUser',
  async (targetUserId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BASE_URL}/follow/follow-user/${targetUserId}`,
        {},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Network Error - Could not reach server';

      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

/**
 * Unfollow a user
 * @param {string} targetUserId - ID of the user to unfollow
 */
export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (targetUserId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BASE_URL}/follow/unfollow-user/${targetUserId}`,
        {},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Network Error - Could not reach server';

      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

const followSlice = createSlice({
  name: 'follow',
  initialState: {
    loading: false,
    successMessage: null,
    error: null,
    backendMessage: null,
  },
  reducers: {
    clearFollowState: state => {
      state.successMessage = null;
      state.error = null;
      state.backendMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(followUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(unfollowUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      });
  },
});

export const {clearFollowState} = followSlice.actions;
export default followSlice.reducer;
