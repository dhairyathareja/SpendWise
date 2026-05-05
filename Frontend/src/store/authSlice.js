import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

const STORAGE_KEY = 'spendwise_auth';

const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
};

const clearSession = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const buildUser = (payload = {}) => ({
  id: payload.id || payload.userId || null,
  name: payload.name || payload.email?.split('@')[0] || 'SpendWise User',
  email: payload.email || '',
  organization: payload.organization || 'SpendWise Workspace',
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const canUseFrontendSession = (error) =>
  !error?.response ||
  error?.code === 'ERR_NETWORK' ||
  error?.message?.toLowerCase().includes('network');

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);

      return {
        user: data.user || buildUser(credentials),
        message: data.message || 'Signed in successfully.',
        offline: false,
      };
    } catch (error) {
      if (canUseFrontendSession(error)) {
        return {
          user: buildUser(credentials),
          message: 'Backend unavailable. Local frontend session created.',
          offline: true,
        };
      }

      return rejectWithValue(getErrorMessage(error, 'Unable to sign in.'));
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/signUp', payload);

      return {
        user: data.user || buildUser(payload),
        message: data.message || 'Account created successfully.',
        offline: false,
      };
    } catch (error) {
      if (canUseFrontendSession(error)) {
        return {
          user: buildUser(payload),
          message: 'Backend unavailable. Local frontend account created.',
          offline: true,
        };
      }

      return rejectWithValue(getErrorMessage(error, 'Unable to create account.'));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    const { user } = getState().auth;

    try {
      await api.post('/auth/logout', { userId: user?.id });
    } catch {
      // Local session state is still cleared below when the API is offline.
    }

    return true;
  }
);

const storedSession = readStoredSession();

const initialState = {
  user: storedSession?.user || null,
  isAuthenticated: Boolean(storedSession?.isAuthenticated),
  status: 'idle',
  error: null,
  apiNotice: null,
  offline: Boolean(storedSession?.offline),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.error = null;
      state.apiNotice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.apiNotice = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.offline = action.payload.offline;
        state.apiNotice = action.payload.offline ? action.payload.message : null;
        persistSession({
          user: action.payload.user,
          isAuthenticated: true,
          offline: action.payload.offline,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to sign in.';
      })
      .addCase(signUpUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.apiNotice = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.offline = action.payload.offline;
        state.apiNotice = action.payload.offline ? action.payload.message : null;
        persistSession({
          user: action.payload.user,
          isAuthenticated: true,
          offline: action.payload.offline,
        });
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to create account.';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        state.apiNotice = null;
        state.offline = false;
        clearSession();
      });
  },
});

export const { clearAuthMessages } = authSlice.actions;
export default authSlice.reducer;
