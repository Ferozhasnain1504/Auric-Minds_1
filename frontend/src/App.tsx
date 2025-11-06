import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VoiceAnalytics from './pages/VoiceAnalytics';
import History from './pages/History';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {

  // ✅ Authentication check from localStorage
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>

        {/* 🔓 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Protected Routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/voice" element={isAuthenticated ? <VoiceAnalytics /> : <Navigate to="/login" />} />
        <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />
        <Route path="/alerts" element={isAuthenticated ? <Alerts /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/login" />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}
