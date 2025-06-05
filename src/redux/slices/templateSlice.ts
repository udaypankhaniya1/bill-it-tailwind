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
  footerPosition?: 'left' | 'center' | 'right';
  footerEnabled?: boolean;
  watermarkText?: string;
  watermarkEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
  whatsappMessageTemplate?: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    muted: string;
  }
}

interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
  currentTheme: string;
  themes: ThemeOption[];
  whatsappMessageTemplate: string;
}

const lightThemes: ThemeOption[] = [
  {
    id: 'light-blue',
    name: 'Azure Light',
    mode: 'light',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      background: '#FFFFFF',
      text: '#1E293B',
      border: '#E2E8F0',
      muted: '#94A3B8',
    }
  },
  {
    id: 'light-green',
    name: 'Emerald Light',
    mode: 'light',
    colors: {
      primary: '#10B981',
      secondary: '#64748B',
      background: '#FFFFFF',
      text: '#1E293B',
      border: '#E2E8F0',
      muted: '#94A3B8',
    }
  },
  {
    id: 'light-purple',
    name: 'Lavender Light',
    mode: 'light',
    colors: {
      primary: '#8B5CF6',
      secondary: '#64748B',
      background: '#FFFFFF',
      text: '#1E293B',
      border: '#E2E8F0',
      muted: '#94A3B8',
    }
  },
  {
    id: 'light-amber',
    name: 'Amber Light',
    mode: 'light',
    colors: {
      primary: '#F59E0B',
      secondary: '#64748B',
      background: '#FFFFFF',
      text: '#1E293B',
      border: '#E2E8F0',
      muted: '#94A3B8',
    }
  },
];

const darkThemes: ThemeOption[] = [
  {
    id: 'dark-blue',
    name: 'Azure Dark',
    mode: 'dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#94A3B8',
      background: '#0F172A',
      text: '#F8FAFC',
      border: '#1E293B',
      muted: '#64748B',
    }
  },
  {
    id: 'dark-green',
    name: 'Emerald Dark',
    mode: 'dark',
    colors: {
      primary: '#34D399',
      secondary: '#94A3B8',
      background: '#0F172A',
      text: '#F8FAFC',
      border: '#1E293B',
      muted: '#64748B',
    }
  },
  {
    id: 'dark-purple',
    name: 'Lavender Dark',
    mode: 'dark',
    colors: {
      primary: '#A78BFA',
      secondary: '#94A3B8',
      background: '#0F172A',
      text: '#F8FAFC',
      border: '#1E293B',
      muted: '#64748B',
    }
  },
  {
    id: 'dark-amber',
    name: 'Amber Dark',
    mode: 'dark',
    colors: {
      primary: '#FBBF24',
      secondary: '#94A3B8',
      background: '#0F172A',
      text: '#F8FAFC',
      border: '#1E293B',
      muted: '#64748B',
    }
  },
];

const defaultTemplate: Template = {
  id: 'default',
  name: 'Default',
  primaryColor: '#000000',
  secondaryColor: '#666666',
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
  footerPosition: 'center',
  footerEnabled: true,
  watermarkText: '',
  watermarkEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  logoUrl: undefined,
  whatsappMessageTemplate: undefined,
};

const defaultWhatsappMessage = `📋 *Invoice #{{invoice_number}}*

🏢 *Client:* {{client_name}}
💰 *Total Amount:* ₹{{total_amount}}

🔗 *View PDF:* {{invoice_link}}

Please check the invoice details in the attached PDF link.`;

const initialState: TemplateState = {
  templates: [defaultTemplate],
  currentTemplate: defaultTemplate,
  isLoading: false,
  error: null,
  currentTheme: 'light-blue',
  themes: [...lightThemes, ...darkThemes],
  whatsappMessageTemplate: defaultWhatsappMessage,
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
    updateTemplateLogo(state, action: PayloadAction<{ id: string; logoUrl: string }>) {
      const template = state.templates.find(t => t.id === action.payload.id);
      if (template) {
        template.logoUrl = action.payload.logoUrl;
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = template;
        }
      }
    },
    setCurrentTheme(state, action: PayloadAction<string>) {
      state.currentTheme = action.payload;
    },
    setWhatsappMessageTemplate(state, action: PayloadAction<string>) {
      state.whatsappMessageTemplate = action.payload;
    },
  },
});

export const {
  setTemplates,
  addTemplate,
  setCurrentTemplate,
  updateTemplate,
  removeTemplate,
  updateTemplateLogo,
  setCurrentTheme,
  setWhatsappMessageTemplate,
} = templateSlice.actions;
export default templateSlice.reducer;
