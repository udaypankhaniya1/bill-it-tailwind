
import { ThemeOption } from '@/redux/slices/templateSlice';

export const applyThemeStyles = (theme: ThemeOption, fontFamily: string = 'inter') => {
  const root = document.documentElement;
  const isDarkMode = theme.mode === 'dark';
  
  // Apply theme colors to CSS variables
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Apply primary and secondary colors
  if (theme.id.includes('blue')) {
    setThemeColor(root, '--primary', isDarkMode ? '217.2 91.2% 59.8%' : '221.2 83.2% 53.3%');
  } else if (theme.id.includes('green')) {
    setThemeColor(root, '--primary', isDarkMode ? '142.1 70.6% 45.3%' : '142.1 76.2% 36.3%');
  } else if (theme.id.includes('purple')) {
    setThemeColor(root, '--primary', isDarkMode ? '262.1 83.3% 57.8%' : '262.1 83.3% 47.8%');
  } else if (theme.id.includes('amber')) {
    setThemeColor(root, '--primary', isDarkMode ? '35.5 91.7% 32.9%' : '40 96.4% 40%');
  }
  
  // Apply background and foreground colors
  if (isDarkMode) {
    setThemeColor(root, '--background', '222.2 84% 4.9%');
    setThemeColor(root, '--foreground', '210 40% 98%');
    
    // Dark mode sidebar
    setThemeColor(root, '--sidebar-background', '240 5.9% 10%');
    setThemeColor(root, '--sidebar-foreground', '240 4.8% 95.9%');
    setThemeColor(root, '--sidebar-border', '240 3.7% 15.9%');
  } else {
    setThemeColor(root, '--background', '0 0% 100%');
    setThemeColor(root, '--foreground', '222.2 84% 4.9%');
    
    // Light mode sidebar
    setThemeColor(root, '--sidebar-background', '0 0% 100%');
    setThemeColor(root, '--sidebar-foreground', '240 5.3% 26.1%');
    setThemeColor(root, '--sidebar-border', '220 13% 91%');
  }
  
  // Apply font family
  document.body.className = document.body.className
    .replace(/font-\w+/g, '')
    .trim() + ` font-${fontFamily}`;
  
  // Store theme preference in local storage
  localStorage.setItem('theme', theme.id);
  localStorage.setItem('fontFamily', fontFamily);
};

const setThemeColor = (root: HTMLElement, property: string, value: string) => {
  root.style.setProperty(property, value);
};

// Function to initialize theme from local storage or defaults
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light-blue';
  const savedFont = localStorage.getItem('fontFamily') || 'inter';
  
  return { themeId: savedTheme, fontFamily: savedFont };
};
