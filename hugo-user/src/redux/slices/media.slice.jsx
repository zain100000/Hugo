/**
 * Redux slice for media upload
 * Handles uploading media files with comprehensive error handling
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
 * Upload media file
 * @param {Object} formData - FormData containing the media file
 * @returns {Object} Success status, message, and media data from backend
 */
export const uploadMedia = createAsyncThunk(
  'media/uploadMedia',
  async (formData, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BASE_URL}/media/user/upload-media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const {success, message, media} = response.data;
      return {success, message, media};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to upload media.';
      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

const mediaSlice = createSlice({
  name: 'media',
  initialState: {
    media: null,
    loading: false,
    error: null,
    message: null,
    backendMessage: null,
  },
  reducers: {
    clearMedia: state => {
      state.media = null;
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
      .addCase(uploadMedia.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.media = action.payload.media;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      });
  },
});

export const {clearMedia, clearError, clearMessage} = mediaSlice.actions;
export default mediaSlice.reducer;
