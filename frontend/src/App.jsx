import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FacultyList from './pages/FacultyList';
import FacultyProfile from './pages/FacultyProfile';
import CreateAccount from './pages/CreateAccount';
import ActivityLogs from './pages/ActivityLogs';
import MyProfile from './pages/MyProfile';
import Home from './pages/Home';
import MyResearch from './pages/MyResearch';
import Explore from './pages/Explore';
import DeptComparison from './pages/DeptComparison';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import PWAInstallPrompt from './components/ui/PWAInstallPrompt';
import OfflineOverlay from './components/ui/OfflineOverlay';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-dark-500 text-sm font-medium">Loading RCEE RIMS...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Offline overlay — covers screen when no internet */}
            <OfflineOverlay />
            {/* PWA install banner (bottom of screen) */}
            <PWAInstallPrompt />

            <Routes>
                <Route path="/login" element={user ? <Navigate to={user.role === 'faculty' ? '/home' : '/dashboard'} /> : <Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Faculty Home */}
                <Route path="/home" element={
                    <ProtectedRoute roles={['faculty', 'hod']}>
                        <Layout><Home /></Layout>
                    </ProtectedRoute>
                } />

                {/* My Research */}
                <Route path="/my-research" element={
                    <ProtectedRoute roles={['faculty', 'hod']}>
                        <Layout><MyResearch /></Layout>
                    </ProtectedRoute>
                } />

                {/* Admin & HOD routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute roles={['admin', 'hod']}>
                        <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/faculty" element={
                    <ProtectedRoute roles={['admin', 'hod']}>
                        <Layout><FacultyList /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/faculty/:id" element={
                    <ProtectedRoute roles={['admin', 'hod']}>
                        <Layout><FacultyProfile /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/explore" element={
                    <ProtectedRoute roles={['admin', 'hod']}>
                        <Layout><Explore /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/compare" element={
                    <ProtectedRoute roles={['admin']}>
                        <Layout><DeptComparison /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/create-account" element={
                    <ProtectedRoute roles={['admin', 'hod']}>
                        <Layout><CreateAccount /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/activity-logs" element={
                    <ProtectedRoute roles={['admin']}>
                        <Layout><ActivityLogs /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/my-profile" element={
                    <ProtectedRoute roles={['faculty', 'hod', 'admin']}>
                        <Layout><MyProfile /></Layout>
                    </ProtectedRoute>
                } />

                {/* 404 — catch all unknown routes */}
                <Route path="/404" element={<NotFound />} />

                {/* Default redirect / catch-all */}
                <Route path="*" element={
                    user
                        ? <NotFound />
                        : <Navigate to="/login" />
                } />
            </Routes>
        </>
    );
};

export default App;
