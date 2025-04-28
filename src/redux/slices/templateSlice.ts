
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Template {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontSize: {
    header: string;
    body: string;
    footer: string;
  };
  showGst: boolean;
  showContact: boolean;
  showLogo: boolean;
  headerPosition: 'left' | 'center' | 'right';
  tableColor: string;
  footerDesign: 'simple' | 'detailed' | 'minimal';
  createdAt: string;
  updatedAt: string;
}

interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
}

const defaultTemplate: Template = {
  id: 'default',
  name: 'Default',
  primaryColor: 'blue',
  secondaryColor: 'gray',
  fontSize: {
    header: 'text-xl',
    body: 'text-base',
    footer: 'text-sm',
  },
  showGst: true,
  showContact: true,
  showLogo: true,
  headerPosition: 'center',
  tableColor: '#f8f9fa',
  footerDesign: 'simple',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialState: TemplateState = {
  templates: [defaultTemplate],
  currentTemplate: defaultTemplate,
  isLoading: false,
  error: null,
};

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setTemplates(state, action: PayloadAction<Template[]>) {
      state.templates = action.payload;
    },
    addTemplate(state, action: PayloadAction<Template>) {
      state.templates.push(action.payload);
    },
    setCurrentTemplate(state, action: PayloadAction<Template | null>) {
      state.currentTemplate = action.payload;
    },
    updateTemplate(state, action: PayloadAction<Template>) {
      const index = state.templates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      if (state.currentTemplate?.id === action.payload.id) {
        state.currentTemplate = action.payload;
      }
    },
    removeTemplate(state, action: PayloadAction<string>) {
      state.templates = state.templates.filter(template => template.id !== action.payload);
      if (state.currentTemplate?.id === action.payload) {
        state.currentTemplate = state.templates[0] || null;
      }
    },
  },
});

export const {
  setTemplates,
  addTemplate,
  setCurrentTemplate,
  updateTemplate,
  removeTemplate,
} = templateSlice.actions;
export default templateSlice.reducer;
