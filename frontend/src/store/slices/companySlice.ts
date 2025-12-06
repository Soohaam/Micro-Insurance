import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyAPI } from '@/services/api';

interface CompanyState {
  products: any[];
  stats: any;
  policies: any[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  products: [],
  stats: null,
  policies: [],
  loading: false,
  uploading: false,
  error: null,
};

export const uploadDocuments = createAsyncThunk(
  'company/uploadDocuments',
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      const response = await companyAPI.uploadDocuments(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const createProduct = createAsyncThunk(
  'company/createProduct',
  async (productData: any, { rejectWithValue }) => {
    try {
      const response = await companyAPI.createProduct(productData);
      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const fetchCompanyProducts = createAsyncThunk(
  'company/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getProducts();
      return response.data.products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'company/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearCompanyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocuments.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocuments.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCompanyProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanyProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchCompanyProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearCompanyError } = companySlice.actions;
export default companySlice.reducer;
