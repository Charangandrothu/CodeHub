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

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Dashboard /> : <LandingPage />} />
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <SignUp />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dsa" element={<DSA />} />
      <Route path="/dsa/:topicId" element={<DSA />} />
      <Route path="/problem/:slug" element={<QuestionPage />} />
      <Route path="/mock-tests" element={<MockTests />} />
      <Route path="/aptitude" element={<Aptitude />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
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
