import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

export type ThemeMode = 'light' | 'dark';
export type CornerStyle = 'rounded' | 'sharp';

interface SettingsState {
  themeMode: ThemeMode;
  cornerStyle: CornerStyle;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setCornerStyle: (style: CornerStyle) => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useSettings = create<SettingsState>()(
  subscribeWithSelector((set, get) => ({
    themeMode: 'light',
    cornerStyle: 'rounded',
    
    setThemeMode: (mode) => {
      set({ themeMode: mode });
      get().saveToStorage();
      
      // Apply theme to document
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    
    setCornerStyle: (style) => {
      set({ cornerStyle: style });
      get().saveToStorage();
    },
    
    loadFromStorage: () => {
      const stored = getLocalStorage('research-settings');
      if (stored) {
        set({
          themeMode: stored.themeMode || 'light',
          cornerStyle: stored.cornerStyle || 'rounded'
        });
        
        // Apply theme immediately
        if (stored.themeMode === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    },
    
    saveToStorage: () => {
      const state = get();
      setLocalStorage('research-settings', {
        themeMode: state.themeMode,
        cornerStyle: state.cornerStyle
      });
    }
  }))
);