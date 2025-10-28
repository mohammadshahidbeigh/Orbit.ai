import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface AppContextType {
  selectedUniversities: number[];
  setSelectedUniversities: (ids: number[]) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark' | null) : null;
    if (stored === 'light' || stored === 'dark') return stored;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo<AppContextType>(() => ({
    selectedUniversities,
    setSelectedUniversities,
    theme,
    toggleTheme,
  }), [selectedUniversities, theme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

