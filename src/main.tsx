import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

// Log Firebase project ID on load (development only)
if (import.meta.env.DEV) {
  console.log("🔧 Firebase Project:", import.meta.env.VITE_FIREBASE_PROJECT_ID || 'using fallback');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </AuthProvider>
  </StrictMode>
);