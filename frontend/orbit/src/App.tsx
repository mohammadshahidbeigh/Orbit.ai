import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from './context/AppContext';
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
    <nav className="border-b bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            Orbit AI
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            {user && (
              <div className="flex items-center gap-2 pl-4 border-l">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <button
                  onClick={signOut}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50">
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
