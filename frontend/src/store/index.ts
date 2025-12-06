import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import kycReducer from './slices/kycSlice';
import productReducer from './slices/productSlice';
import policyReducer from './slices/policySlice';
import adminReducer from './slices/adminSlice';
import companyReducer from './slices/companySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kyc: kycReducer,
    product: productReducer,
    policy: policyReducer,
    admin: adminReducer,
    company: companyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
