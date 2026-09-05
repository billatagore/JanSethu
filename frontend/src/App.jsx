import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layout
import Navigation from './components/Navigation'
import Footer from './components/Footer'

// Pages
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import HowItWorks from './pages/HowItWorks'
import ExploreChallenges from './pages/ExploreChallenges'
import ProblemDetails from './pages/ProblemDetails'
import SubmitProblem from './pages/SubmitProblem'
import MyProblems from './pages/MyProblems'
import AIAnalysis from './pages/AIAnalysis'
import SolutionSubmission from './pages/SolutionSubmission'
import TeamWorkspace from './pages/TeamWorkspace'
import Dashboard from './pages/Dashboard'
import UserProfile from './pages/UserProfile'
import ImpactDashboard from './pages/ImpactDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MessagesPage from './pages/MessagesPage'
import NotificationsPage from './pages/NotificationsPage'
import ProblemMapPage from './pages/ProblemMapPage'

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token } = useAuth()
  
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/explore" element={<ExploreChallenges />} />
      <Route path="/map" element={<ProblemMapPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/problems/:id" element={<ProblemDetails />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit-problem"
        element={
          <ProtectedRoute>
            <SubmitProblem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-problems"
        element={
          <ProtectedRoute>
            <MyProblems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems/:id/analyze"
        element={
          <ProtectedRoute>
            <AIAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems/:id/solution"
        element={
          <ProtectedRoute>
            <SolutionSubmission />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams/:id"
        element={
          <ProtectedRoute>
            <TeamWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/impact"
        element={
          <ProtectedRoute>
            <ImpactDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppContent() {
  const { token } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      {token && <Navigation />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {token && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
