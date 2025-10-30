import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Practice from './pages/Practice';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';

function App() {
  const { user, initializeApp } = useStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    // Apply theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || user?.preferences.theme || 'light';

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'auto') {
      // Auto mode: follow system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/nihongo-master">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: document.documentElement.classList.contains('dark') ? '#2d3748' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#f7fafc' : '#1a202c',
            border: '1px solid',
            borderColor: document.documentElement.classList.contains('dark') ? 'rgba(99, 102, 241, 0.3)' : '#e2e8f0',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<Learn />} />
          <Route path="practice" element={<Practice />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
