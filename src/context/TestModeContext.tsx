import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TestModeContextType {
  isTestMode: boolean;
  toggleTestMode: () => void;
}

const TestModeContext = createContext<TestModeContextType | null>(null);

export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (!context) {
    throw new Error('useTestMode must be used within a TestModeProvider');
  }
  return context;
};

interface TestModeProviderProps {
  children: ReactNode;
}

export const TestModeProvider: React.FC<TestModeProviderProps> = ({ children }) => {
  const [isTestMode, setIsTestMode] = useState(false);

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    console.log(`Test Mode ${!isTestMode ? 'ENABLED' : 'DISABLED'}`);
  };

  return (
    <TestModeContext.Provider value={{ isTestMode, toggleTestMode }}>
      {children}
    </TestModeContext.Provider>
  );
};