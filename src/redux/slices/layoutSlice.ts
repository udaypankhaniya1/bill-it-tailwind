
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LayoutState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  lastRoute: string | null;
}

const initialState: LayoutState = {
  sidebarOpen: true,
  theme: 'light',
  lastRoute: null,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLastRoute: (state, action: PayloadAction<string | null>) => {
      state.lastRoute = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setLastRoute } = layoutSlice.actions;
export default layoutSlice.reducer;
