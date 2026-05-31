import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Layout Imports
import StudentLayout from './layouts/StudentLayout';
import FacultyLayout from './layouts/FacultyLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Page Imports
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Student Page Imports
import StudentDashboard from './pages/student/Dashboard';
import SubmitGrievance from './pages/student/SubmitGrievance';
import MyGrievances from './pages/student/MyGrievances';
import TrackGrievance from './pages/student/TrackGrievance';
import Profile from './pages/student/Profile';

// Faculty Page Imports
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AssignedGrievances from './pages/faculty/AssignedGrievances';
import ResponsePage from './pages/faculty/ResponsePage';

// Admin Page Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import GrievanceManagement from './pages/admin/GrievanceManagement';
import Reports from './pages/admin/Reports';

// Role Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' }}>Verifying security credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but unauthorized role, fallback to their dashboard
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'Faculty') return <Navigate to="/faculty/dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Protected Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="submit" element={<SubmitGrievance />} />
          <Route path="grievances" element={<MyGrievances />} />
          <Route path="track" element={<TrackGrievance />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Faculty Protected Routes */}
        <Route path="/faculty" element={
          <ProtectedRoute allowedRoles={['Faculty']}>
            <FacultyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="grievances" element={<AssignedGrievances />} />
          <Route path="respond" element={<ResponsePage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="grievances" element={<GrievanceManagement />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Wildcard Catchall Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
};

export default App;
