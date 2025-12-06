import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { policyAPI } from '@/services/api';

interface Policy {
  policyId: string;
  policyNumber: string;
  productName: string;
  sumInsured: number;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  transactionHash?: string;
  daysRemaining?: number;
}

interface PolicyState {
  policies: Policy[];
  selectedPolicy: Policy | null;
  loading: boolean;
  purchasing: boolean;
  error: string | null;
}

const initialState: PolicyState = {
  policies: [],
  selectedPolicy: null,
  loading: false,
  purchasing: false,
  error: null,
};

export const purchasePolicy = createAsyncThunk(
  'policy/purchase',
  async (policyData: any, { rejectWithValue }) => {
    try {
      const response = await policyAPI.purchase(policyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Purchase failed');
    }
  }
);

export const fetchMyPolicies = createAsyncThunk(
  'policy/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await policyAPI.getMyPolicies();
      return response.data.policies;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch policies');
    }
  }
);

export const fetchPolicyStatus = createAsyncThunk(
  'policy/fetchStatus',
  async (policyId: string, { rejectWithValue }) => {
    try {
      const response = await policyAPI.getStatus(policyId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch policy status');
    }
  }
);

const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {
    clearPolicyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchasePolicy.pending, (state) => {
        state.purchasing = true;
        state.error = null;
      })
      .addCase(purchasePolicy.fulfilled, (state, action) => {
        state.purchasing = false;
        state.policies.unshift(action.payload.policy);
      })
      .addCase(purchasePolicy.rejected, (state, action) => {
        state.purchasing = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMyPolicies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchMyPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPolicyStatus.fulfilled, (state, action) => {
        state.selectedPolicy = action.payload.policy;
      });
  },
});

export const { clearPolicyError } = policySlice.actions;
export default policySlice.reducer;
