
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InvoiceItem {
  id: string;
  description: string;
  gujarati_description?: string; // Added support for Gujarati descriptions
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  partyName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setInvoices(state, action: PayloadAction<Invoice[]>) {
      state.invoices = action.payload;
    },
    addInvoice(state, action: PayloadAction<Invoice>) {
      state.invoices.push(action.payload);
    },
    setCurrentInvoice(state, action: PayloadAction<Invoice | null>) {
      state.currentInvoice = action.payload;
    },
    updateInvoice(state, action: PayloadAction<Invoice>) {
      const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
      if (state.currentInvoice?.id === action.payload.id) {
        state.currentInvoice = action.payload;
      }
    },
    removeInvoice(state, action: PayloadAction<string>) {
      state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
      if (state.currentInvoice?.id === action.payload) {
        state.currentInvoice = null;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setInvoices,
  addInvoice,
  setCurrentInvoice,
  updateInvoice,
  removeInvoice,
  setLoading,
  setError,
} = invoiceSlice.actions;
export default invoiceSlice.reducer;
