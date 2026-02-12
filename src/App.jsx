import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'

import CompleteProfile from './pages/CompleteProfile'
import Dashboard from './pages/Dashboard'
import DSA from './pages/DSA'
import TopicPage from './pages/TopicPage'
import QuestionPage from './pages/QuestionPage'
import Pricing from './pages/Pricing'
import MockTests from './pages/MockTests'
import Aptitude from './pages/Aptitude'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

// Admin Imports
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import UsersManagement from './pages/admin/UsersManagement'
import Payments from './pages/admin/Payments'
import Problems from './pages/admin/Problems'
import Categories from './pages/admin/Categories'
import AdminSettings from './pages/admin/Settings'

import { useAuth } from './context/AuthContext'

import PublicRoute from './components/routes/PublicRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Only for non-authenticated users */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />

      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Protected Routes - Only for authenticated users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dsa" element={
        <ProtectedRoute>
          <DSA />
        </ProtectedRoute>
      } />
      <Route path="/dsa/:topicId" element={
        <ProtectedRoute>
          <DSA />
        </ProtectedRoute>
      } />
      <Route path="/problem/:slug" element={
        <ProtectedRoute>
          <QuestionPage />
        </ProtectedRoute>
      } />
      <Route path="/mock-tests" element={
        <ProtectedRoute>
          <MockTests />
        </ProtectedRoute>
      } />
      <Route path="/aptitude" element={
        <ProtectedRoute>
          <Aptitude />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/:username" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="payments" element={<Payments />} />
        <Route path="problems" element={<Problems />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const ConditionalNavbar = () => {
  const location = useLocation();
  const isDSAPage = location.pathname.startsWith('/dsa');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <AnimatePresence>
      {!isDSAPage && !isAdminPage && <Navbar key="navbar" />}
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="bg-[#0a0a0a] min-h-screen text-white">
        <ScrollToTop />
        <ErrorBoundary>
          <ConditionalNavbar />
          <AppRoutes />
        </ErrorBoundary>
      </div>
    </Router>
  )
}

export default App
