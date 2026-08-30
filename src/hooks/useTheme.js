import { useState, useEffect } from 'react';

export function useTheme() {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('ruea_roy_theme') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeMode);
    localStorage.setItem('ruea_roy_theme', themeMode);
  }, [themeMode]);

  return {
    themeMode,
    setThemeMode
  };
}
