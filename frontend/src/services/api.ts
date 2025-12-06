import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  registerUser: (data: any) => api.post('/auth/register/user', data),
  registerCompany: (data: any) => api.post('/auth/register/company', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateWallet: (walletAddress: string) => api.put('/auth/wallet', { walletAddress }),
};

// KYC APIs
export const kycAPI = {
  uploadAadhaar: (formData: FormData) => {
    return api.post('/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getStatus: () => api.get('/kyc/status'),
};

// Product APIs
export const productAPI = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/user/products${params ? `?${params}` : ''}`);
  },
  getById: (productId: string) => api.get(`/user/products/${productId}`),
};

// Policy APIs
export const policyAPI = {
  purchase: (data: any) => api.post('/user/policies/purchase', data),
  getMyPolicies: (status?: string) => {
    return api.get(`/user/policies${status ? `?status=${status}` : ''}`);
  },
  getStatus: (policyId: string) => api.get(`/user/policies/${policyId}/status`),
  getMyClaims: () => api.get('/user/claims'),
};

// Admin APIs
export const adminAPI = {
  getPendingCompanies: () => api.get('/admin/companies/pending'),
  getCompanyById: (companyId: string) => api.get(`/admin/companies/${companyId}`),
  updateCompanyStatus: (companyId: string, data: any) => 
    api.put(`/admin/companies/${companyId}/status`, data),
  
  getPendingKYCs: () => api.get('/admin/kyc/pending'),
  getKYCById: (kycId: string) => api.get(`/admin/kyc/${kycId}`),
  updateKYCStatus: (kycId: string, data: any) => 
    api.put(`/admin/kyc/${kycId}/status`, data),
  
  getUsers: (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserById: (userId: string) => api.get(`/admin/users/${userId}`),
  
  getStats: () => api.get('/admin/stats'),
};

// Company APIs
export const companyAPI = {
  uploadDocuments: (formData: FormData) => {
    return api.post('/company/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  createProduct: (data: any) => api.post('/company/products', data),
  getProducts: () => api.get('/company/products'),
  updateProduct: (productId: string, data: any) => 
    api.put(`/company/products/${productId}`, data),
  deactivateProduct: (productId: string) => 
    api.post(`/company/products/${productId}/deactivate`),
  getStats: () => api.get('/company/dashboard/stats'),
  getPolicies: (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/company/policies${queryString ? `?${queryString}` : ''}`);
  },
};

export default api;
