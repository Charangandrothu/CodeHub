import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import DSA from './pages/DSA'
import TopicPage from './pages/TopicPage'
import QuestionPage from './pages/QuestionPage'
import Pricing from './pages/Pricing'
import MockTests from './pages/MockTests'
import Aptitude from './pages/Aptitude'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

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
      <Route path="/signup" element={<SignUp />} />
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
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-[#0a0a0a] min-h-screen text-white">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  )
}

export default App
