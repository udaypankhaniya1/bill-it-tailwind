
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import invoiceReducer from './slices/invoiceSlice';
import templateReducer from './slices/templateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoice: invoiceReducer,
    template: templateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
