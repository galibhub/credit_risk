
import { Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import DashboardPage from '../pages/user/DashboardPage';
import NewAssessmentPage from '../pages/user/NewAssessmentPage';
import AssessmentHistoryPage from '../pages/user/AssessmentHistoryPage';
import AssessmentDetailsPage from '../pages/user/AssessmentDetailsPage';
import ModelInsightsPage from '../pages/user/ModelInsightsPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User workspace */}
      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="new-assessment"
            element={<NewAssessmentPage />}
          />

          <Route
            path="history"
            element={<AssessmentHistoryPage />}
          />

          <Route
            path="assessments/:assessmentId"
            element={<AssessmentDetailsPage />}
          />

          <Route
            path="model-insights"
            element={<ModelInsightsPage />}
          />
        </Route>
      </Route>

      {/* Admin workspace */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboardPage />}
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}