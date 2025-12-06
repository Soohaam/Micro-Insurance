import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kycAPI } from '@/services/api';

interface KYCData {
  kycId: string;
  status: 'pending' | 'verified' | 'rejected';
  aadhaarName: string;
  aadhaarNumber: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface KYCState {
  data: KYCData | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: KYCState = {
  data: null,
  loading: false,
  uploading: false,
  error: null,
};

export const uploadAadhaar = createAsyncThunk(
  'kyc/upload',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('aadhaar', file);
      const response = await kycAPI.uploadAadhaar(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const getKYCStatus = createAsyncThunk(
  'kyc/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await kycAPI.getStatus();
      return response.data;
    } catch (error: any) {
      // If 404, it means no KYC exists yet - return null instead of error
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearKYCError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadAadhaar.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadAadhaar.fulfilled, (state, action) => {
        state.uploading = false;
        state.data = action.payload.kyc;
      })
      .addCase(uploadAadhaar.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getKYCStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKYCStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getKYCStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearKYCError } = kycSlice.actions;
export default kycSlice.reducer;
