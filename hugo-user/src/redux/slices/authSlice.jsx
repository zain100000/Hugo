/**
 * Redux slice for authentication management
 * Handles user registration, login, logout, and OTP operations
 * Includes comprehensive error handling and backend message propagation
 */
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

/**
 * Sends OTP to the provided phone number for verification
 * @param {Object} formData - Contains phone number for OTP
 * @returns {Object} Success status, message, and OTP data from backend
 */
export const sendOTP = createAsyncThunk(
  'otp/sendOTP',
  async (formData, {rejectWithValue}) => {
    try {
      const response = await axios.post(`${BASE_URL}/otp/send-otp`, formData);
      const {success, message, otp} = response.data;
      return {success, message, otp};
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
 * Verifies the OTP entered by the user
 * @param {Object} formData - Contains phone number and OTP code
 * @returns {Object} Success status and message from backend
 */
export const verifyOTP = createAsyncThunk(
  'otp/verifyOTP',
  async (formData, {rejectWithValue}) => {
    try {
      const response = await axios.post(`${BASE_URL}/otp/verify-otp`, formData);
      const {success, message} = response.data;
      return {success, message};
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
 * Registers a new user with provided form data
 * @param {Object} formData - User registration data including profile image
 * @returns {Object} Success status, message, and user data from backend
 */
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (formData, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user/signup-user`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );
      const {success, message, user, token} = response.data;
      return {success, message, user, token};
    } catch (error) {
      const errorData = error.response?.data || {
        message: 'Network Error - Could not reach server',
      };
      return rejectWithValue({
        message: errorData.message,
        backendMessage: errorData.message || null,
      });
    }
  },
);

/**
 * Authenticates user with login credentials
 * @param {Object} loginData - User login credentials (email/phone and password)
 * @returns {Object} Success status, message, token, and user data from backend
 */
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (loginData, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user/signin-user`,
        loginData,
      );
      const {token, user, success, message} = response.data;
      await AsyncStorage.setItem('authToken', token);
      return {success, message, token, user};
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
 * Logs out the current user and clears authentication data
 * @returns {Object} Success status and message from backend
 */
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BASE_URL}/user/logout-user`,
        {},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      await AsyncStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Unknown error occurred.';
      return rejectWithValue({
        message: errorMessage,
        backendMessage: error?.response?.data?.message || null,
      });
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    backendMessage: null, // New state to store backend-specific messages
    isOtpSent: false,
    isOtpVerified: false,
    message: null,
    otp: null,
  },
  reducers: {
    /**
     * Clears any error messages from the auth state
     */
    clearError: state => {
      state.error = null;
      state.backendMessage = null;
    },
    /**
     * Clears any success messages from the auth state
     */
    clearMessage: state => {
      state.message = null;
      state.backendMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(sendOTP.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isOtpSent = action.payload.success;
        state.otp = action.payload.otp;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(verifyOTP.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isOtpVerified = action.payload.success;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      })
      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.message = action.payload.message;
        state.backendMessage = action.payload.message;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      });
  },
});

export const {clearError, clearMessage} = authSlice.actions;
export default authSlice.reducer;
