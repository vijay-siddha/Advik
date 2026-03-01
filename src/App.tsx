import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';
// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import { ProjectList } from './pages/projects/ProjectList';
import { ProjectDetail } from './pages/projects/ProjectDetail';
import { BenchmarkForm } from './pages/benchmarks/BenchmarkForm';
import { ComparisonView } from './pages/benchmarks/ComparisonView';
import { Reports } from './pages/reports/Reports';
import React from 'react';

// Define PrivateRoute component - CLEANED UP ✅
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          
          <Route element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/benchmarks/new" element={<BenchmarkForm />} />
            <Route path="/benchmarks/:id/edit" element={<BenchmarkForm />} />
            <Route path="/compare" element={<ComparisonView />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;