import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import { Orbit } from './pages/Orbit';
import { ManageSchools } from './pages/ManageSchools';
import { Login } from './pages/Login';
import { Recommendations } from './pages/Recommendations';
// import { TaskBoard } from './pages/TaskBoard';
// import { Timeline } from './pages/Timeline';
import { CompareUniversities } from './pages/CompareUniversities';
import { PeerInsights } from './pages/PeerInsights';
import './App.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useApp();
  
  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return null;
  }
  
  const navItems = [
    { path: '/', label: 'Orbit', icon: '📊' },
    { path: '/manage-schools', label: 'Manage Schools', icon: '🏫' },
    { path: '/compare', label: 'Compare', icon: '⚖️' },
    { path: '/peer-insights', label: 'Peer Insights', icon: '👥' },
  ];

  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            Orbit AI
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-4 border-l">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <button
                  onClick={signOut}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle navigation menu"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav panel */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2 pt-2 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              {/* Theme toggle mobile */}
              <button
                onClick={() => { toggleTheme(); setIsOpen(false); }}
                className="mt-2 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}
              </button>
              {user && (
                <div className="flex items-center justify-between px-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground truncate pr-2">{user.email}</span>
                  <button
                    onClick={() => { setIsOpen(false); signOut(); }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Orbit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-schools"
        element={
          <ProtectedRoute>
            <ManageSchools />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/task-board"
        element={
          <ProtectedRoute>
            <TaskBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timeline"
        element={
          <ProtectedRoute>
            <Timeline />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/compare"
        element={
          <ProtectedRoute>
            <CompareUniversities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/peer-insights"
        element={
          <ProtectedRoute>
            <PeerInsights />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navigation />
      <main className="py-6">
        <AppRoutes />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
