import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppContextType {
  selectedUniversities: number[];
  setSelectedUniversities: (ids: number[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([]);

  return (
    <AppContext.Provider value={{ selectedUniversities, setSelectedUniversities }}>
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

