import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Core Profile Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BranchesPage from './pages/BranchesPage';
import BranchDetailPage from './pages/BranchDetailPage';
import TeachersPage from './pages/TeachersPage';
import TeacherDetailPage from './pages/TeacherDetailPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import StartupsPage from './pages/StartupsPage';
import AchievementsPage from './pages/AchievementsPage';
import SchoolLifePage from './pages/SchoolLifePage';
import MediaPage from './pages/MediaPage';
import TimelinePage from './pages/TimelinePage';
import SearchPage from './pages/SearchPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ApplicationPage from './pages/ApplicationPage';
import AIAgentPage from './pages/AIAgentPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminBranches from './pages/admin/AdminBranches';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminAchievements from './pages/admin/AdminAchievements';
import AdminProjects from './pages/admin/AdminProjects';
import AdminNews from './pages/admin/AdminNews';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLanguages from './pages/admin/AdminLanguages';
import AdminMedia from './pages/admin/AdminMedia';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Route component (Redirects to /login preserving destination)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="spinner !w-8 !h-8 !border-3 border-school-600 border-t-transparent" />
      </div>
    );
  }
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// Public Auth Route (Redirects authenticated users directly into platform)
const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="spinner !w-8 !h-8 !border-3 border-school-600 border-t-transparent" />
      </div>
    );
  }
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* ─── Public Authentication Routes (Entry Point) ─── */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <RegisterPage />
          </PublicAuthRoute>
        }
      />
      <Route path="/auth/callback" element={<Navigate to="/login" replace />} />

      {/* ─── Main NIS AI School Platform (Protected by PrivateRoute) ─── */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Main Identity & Showcase */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Campuses (supported with both /campuses and /branches) */}
        <Route path="/campuses" element={<BranchesPage />} />
        <Route path="/campuses/:id" element={<BranchDetailPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/:id" element={<BranchDetailPage />} />

        {/* Teachers */}
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teachers/:id" element={<TeacherDetailPage />} />

        {/* Students, IELTS & Achievements */}
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/results" element={<AchievementsPage />} />
        <Route path="/ielts" element={<StudentsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />

        {/* Projects & Startups */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectsPage />} />
        <Route path="/startups" element={<StartupsPage />} />
        <Route path="/startups/:id" element={<StartupsPage />} />

        {/* School Life, Media & Timeline */}
        <Route path="/school-life" element={<SchoolLifePage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/timeline" element={<TimelinePage />} />

        {/* Search */}
        <Route path="/search" element={<SearchPage />} />

        {/* News & Events */}
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/events" element={<EventsPage />} />

        {/* Official NIS AI AGENT */}
        <Route path="/ai-agent" element={<AIAgentPage />} />

        {/* User Profile & Settings */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* School Application */}
        <Route path="/application" element={<ApplicationPage />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ─── Admin Routes ─── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="branches" element={<AdminBranches />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="achievements" element={<AdminAchievements />} />
        <Route path="students" element={<AdminAchievements />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="languages" element={<AdminLanguages />} />
        <Route path="settings/languages" element={<AdminLanguages />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="activities" element={<AdminActivityLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
