import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '@/services/api';

interface AdminState {
  pendingCompanies: any[];
  pendingKYCs: any[];
  stats: any;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  pendingCompanies: [],
  pendingKYCs: [],
  stats: null,
  loading: false,
  error: null,
};

export const fetchPendingCompanies = createAsyncThunk(
  'admin/fetchPendingCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingCompanies();
      return response.data.companies;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const updateCompanyStatus = createAsyncThunk(
  'admin/updateCompanyStatus',
  async ({ companyId, status, remarks }: any, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateCompanyStatus(companyId, { status, remarks });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const fetchPendingKYCs = createAsyncThunk(
  'admin/fetchPendingKYCs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingKYCs();
      return response.data.kycs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYCs');
    }
  }
);

export const updateKYCStatus = createAsyncThunk(
  'admin/updateKYCStatus',
  async ({ kycId, status, rejectionReason }: any, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateKYCStatus(kycId, { status, rejectionReason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update KYC');
    }
  }
);

export const fetchPlatformStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCompanies = action.payload;
      })
      .addCase(fetchPendingCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        const companyId = action.meta.arg.companyId;
        state.pendingCompanies = state.pendingCompanies.filter(c => c.companyId !== companyId);
      });

    builder
      .addCase(fetchPendingKYCs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingKYCs.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingKYCs = action.payload;
      })
      .addCase(fetchPendingKYCs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateKYCStatus.fulfilled, (state, action) => {
        const kycId = action.meta.arg.kycId;
        state.pendingKYCs = state.pendingKYCs.filter(k => k.kycId !== kycId);
      });

    builder
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
