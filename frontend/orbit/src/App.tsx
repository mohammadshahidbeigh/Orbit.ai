import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './pages/Dashboard';
import { ManageSchools } from './pages/ManageSchools';
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
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/manage-schools', label: 'Manage Schools', icon: '🏫' },
    { path: '/task-board', label: 'Task Board', icon: '📋' },
    { path: '/timeline', label: 'Timeline', icon: '📅' },
    { path: '/compare', label: 'Compare', icon: '⚖️' },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            Orbit AI - Application Planner
          </Link>
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
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/manage-schools" element={<ManageSchools />} />
      <Route path="/task-board" element={<div className="container mx-auto p-6"><h1 className="text-2xl">Task Board - Coming Soon</h1></div>} />
      <Route path="/timeline" element={<div className="container mx-auto p-6"><h1 className="text-2xl">Timeline - Coming Soon</h1></div>} />
      <Route path="/compare" element={<div className="container mx-auto p-6"><h1 className="text-2xl">Compare Universities - Coming Soon</h1></div>} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="py-6">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
