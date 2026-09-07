import { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

const CompleteProfile = lazy(() => import('./pages/CompleteProfile'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DSA = lazy(() => import('./pages/DSA'))
const TopicPage = lazy(() => import('./pages/TopicPage'))
const QuestionPage = lazy(() => import('./pages/QuestionPage'))
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'))
const Pricing = lazy(() => import('./pages/Pricing'))
const MockTests = lazy(() => import('./pages/MockTests'))
const MockTestWindow = lazy(() => import('./pages/MockTestWindow'))
const MockTestResult = lazy(() => import('./pages/MockTestResult'))
const Aptitude = lazy(() => import('./pages/Aptitude'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'))
const CompanyPractice = lazy(() => import('./pages/CompanyPractice'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Referrals = lazy(() => import('./pages/Referrals'))

const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const NotFound = lazy(() => import('./pages/NotFound'))
const About = lazy(() => import('./pages/About'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const Disclaimer = lazy(() => import('./pages/Disclaimer'))
const Contact = lazy(() => import('./pages/Contact'))
const Articles = lazy(() => import('./pages/Articles'))
const ArticleView = lazy(() => import('./pages/ArticleView'))
const Maintenance = lazy(() => import('./pages/Maintenance'))
const InterviewDashboard = lazy(() => import('./pages/InterviewDashboard'))
const InterviewLive = lazy(() => import('./pages/InterviewLive'))
const InterviewReport = lazy(() => import('./pages/InterviewReport'))

// Admin Imports
import AdminLayout from './layouts/AdminLayout'
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'))
const Payments = lazy(() => import('./pages/admin/Payments'))
const Problems = lazy(() => import('./pages/admin/Problems'))
const CompanyQuestions = lazy(() => import('./pages/admin/CompanyQuestions'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const Announcements = lazy(() => import('./pages/admin/Announcements'))
const MockTestsManagement = lazy(() => import('./pages/admin/MockTestsManagement'))
const ReferralsManagement = lazy(() => import('./pages/admin/ReferralsManagement'))

const SecureAdminLogin = lazy(() => import('./pages/admin/SecureAdminLogin'))
const SecureAdminPricing = lazy(() => import('./pages/admin/SecureAdminPricing'))
import { useAuth } from './context/AuthContext'

import PublicRoute from './components/routes/PublicRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';

function AppRoutes() {
  const { userData, platformSettings } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('referredBy', refCode);
      console.log('Saved referral code to localStorage:', refCode);
    }
  }, [location]);

  if (platformSettings?.maintenanceMode) {
    const isAdmin = userData?.role === 'admin';
    const isLogin = location.pathname === '/login';
    const isAdminRoute = location.pathname.startsWith('/admin');

    // If not admin, not on login page, and not accessing admin routes -> Show Maintenance
    if (!isAdmin && !isLogin && !isAdminRoute) {
      return (
        <Routes>
          <Route path="*" element={<Maintenance />} />
        </Routes>
      );
    }
  }

  return (
    <Routes>
      {/* Public Routes - Only for non-authenticated users */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:slug" element={<ArticleView />} />

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
      <Route path="/roadmap/*" element={
        <ProtectedRoute>
          <RoadmapPage />
        </ProtectedRoute>
      } />
      <Route path="/mock-tests" element={
        <ProtectedRoute>
          <MockTests />
        </ProtectedRoute>
      } />
      <Route path="/mock-tests/test/:testId" element={
        <ProtectedRoute>
          <MockTestWindow />
        </ProtectedRoute>
      } />
      <Route path="/mock-tests/result/:attemptId" element={
        <ProtectedRoute>
          <MockTestResult />
        </ProtectedRoute>
      } />
      <Route path="/aptitude" element={
        <ProtectedRoute>
          <Aptitude />
        </ProtectedRoute>
      } />
      <Route path="/companies" element={
        <ProtectedRoute>
          <Companies />
        </ProtectedRoute>
      } />
      <Route path="/referrals" element={
        <ProtectedRoute>
          <Referrals />
        </ProtectedRoute>
      } />
      <Route path="/companies/:slug" element={
        <ProtectedRoute>
          <CompanyDetail />
        </ProtectedRoute>
      } />
      <Route path="/companies/:slug/:tab" element={
        <ProtectedRoute>
          <CompanyDetail />
        </ProtectedRoute>
      } />
      <Route path="/companies/:company/practice/:section/:topic" element={
        <ProtectedRoute>
          <CompanyPractice />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/profile/:username" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/interview" element={
        <ProtectedRoute>
          <InterviewDashboard />
        </ProtectedRoute>
      } />
      <Route path="/interview/live" element={
        <ProtectedRoute>
          <InterviewLive />
        </ProtectedRoute>
      } />
      <Route path="/interview/report/:id" element={
        <ProtectedRoute>
          <InterviewReport />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/secure-admin-portal" element={<SecureAdminLogin />} />
      <Route path="/secure-admin/pricing" element={<SecureAdminPricing />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="payments" element={<Payments />} />
        <Route path="problems" element={<Problems />} />
        <Route path="company-questions" element={<CompanyQuestions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="mock-tests" element={<MockTestsManagement />} />
        <Route path="referrals" element={<ReferralsManagement />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const ConditionalNavbar = () => {
  const location = useLocation();
  const isDSAPage = location.pathname.startsWith('/dsa');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isRoadmapSubPage = location.pathname.startsWith('/roadmap/dsa') || location.pathname.startsWith('/roadmap/aptitude');
  const isLoginPage = location.pathname === '/login';
  const isCompanyPracticePage = location.pathname.includes('/practice/');
  const isAptitudePage = location.pathname.startsWith('/aptitude');
  const isMockTestWindow = location.pathname.startsWith('/mock-tests/test/');
  const isInterviewPage = location.pathname.startsWith('/interview');

  return (
    <AnimatePresence>
      {!isDSAPage && !isAdminPage && !isRoadmapSubPage && !isLoginPage && !isCompanyPracticePage && !isAptitudePage && !isMockTestWindow && !isInterviewPage && <Navbar key="navbar" />}
    </AnimatePresence>
  );
};

import AnnouncementBar from './components/AnnouncementBar';
import SarvamAIBot from './components/SarvamAIBot';

function App() {
  const [reduceMotion, setReduceMotion] = useState(false);

  // ── Server warm-up: ping backend immediately on load so Render never feels
  // cold to users. Repeats every 10 min while the tab is open.
  const warmUpServer = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/health`, { method: 'GET', cache: 'no-store' })
      .catch(() => {}); // silent — never show errors to users
  }, []);

  useEffect(() => {
    warmUpServer(); // fire immediately on mount
    const keepAliveInterval = setInterval(warmUpServer, 10 * 60 * 1000); // every 10 min
    return () => clearInterval(keepAliveInterval);
  }, [warmUpServer]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    const updateMotionPreference = () => {
      setReduceMotion(mobileQuery.matches);
    };

    updateMotionPreference();
    mobileQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mobileQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  return (
    <Router>
      <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
        <div className="bg-[#0a0a0a] min-h-screen text-white relative">
          <ScrollToTop />
            <ErrorBoundary>
            <AnnouncementBar />
            <ConditionalNavbar />
            <SarvamAIBot />
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </div>
      </MotionConfig>
    </Router>
  )
}

export default App
