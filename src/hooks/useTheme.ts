"use client";

import { useState, useEffect, useCallback } from 'react';
import { Theme, ThemeConfig } from '@/types';
import { storage, getThemeConfig } from '@/utils';
import { Monitor, Sun, Palette } from 'lucide-react';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('slate');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = storage.get<Theme>('theme', 'slate');
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    const config = getThemeConfig(theme);
    
    // Remove existing theme classes
    root.classList.remove('theme-slate', 'theme-light', 'theme-blue', 'theme-purple');
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Update CSS variables
    root.style.setProperty('--primary', config.primaryColor);
    root.style.setProperty('--primary-foreground', config.primaryForeground);
  }, []);

  const changeTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    storage.set('theme', theme);
  }, [applyTheme]);

  const themes: ThemeConfig[] = [
    {
      name: 'slate',
      label: 'Slate',
      icon: <Monitor className="h-4 w-4" />,
      gradient: 'from-slate-500 to-slate-700',
      primaryColor: 'hsl(215, 25%, 27%)',
      primaryForeground: 'hsl(210, 40%, 98%)'
    },
    {
      name: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      gradient: 'from-gray-300 to-gray-500',
      primaryColor: 'hsl(222.2, 84%, 4.9%)',
      primaryForeground: 'hsl(210, 40%, 98%)'
    },
    {
      name: 'blue',
      label: 'Blue',
      icon: <Palette className="h-4 w-4" />,
      gradient: 'from-blue-500 to-blue-700',
      primaryColor: 'hsl(221.2, 83.2%, 53.3%)',
      primaryForeground: 'hsl(210, 40%, 98%)'
    },
    {
      name: 'purple',
      label: 'Purple',
      icon: <Palette className="h-4 w-4" />,
      gradient: 'from-purple-500 to-purple-700',
      primaryColor: 'hsl(262.1, 83.3%, 57.8%)',
      primaryForeground: 'hsl(210, 40%, 98%)'
    }
  ];

  return {
    currentTheme,
    changeTheme,
    themes,
    applyTheme
  };
};
