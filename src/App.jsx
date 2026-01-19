import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import DSA from './pages/DSA'
import TopicPage from './pages/TopicPage'
import QuestionPage from './pages/QuestionPage'
import { useAuth } from './context/AuthContext'

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Dashboard /> : <Hero />} />
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dsa" element={<DSA />} />
      <Route path="/dsa/:topicId" element={<DSA />} />
      <Route path="/problem/:slug" element={<QuestionPage />} />
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
