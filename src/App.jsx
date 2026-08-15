import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { ProgressProvider, useProgress } from './contexts/ProgressProvider';
import { NotesProvider } from './contexts/NotesProvider';
import RewardOverlay from './components/dashboard/RewardOverlay';
import UnitAchievementCard from './components/dashboard/UnitAchievementCard';
import ErrorBoundary from './components/ErrorBoundary';
import NebulaChatbot from './components/NebulaChatbot';

// Lazy-loaded route pages — keeps the initial bundle small by splitting
// heavy pages (Monaco editor, mermaid, three.js) into separate chunks.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LearningLayout = lazy(() => import('./pages/LearningLayout'));
const CourseSyllabus = lazy(() => import('./pages/CourseSyllabus'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminAccess = lazy(() => import('./pages/AdminAccess'));
const AdminRegexPlayground = lazy(() => import('./pages/AdminRegexPlayground'));
const Library = lazy(() => import('./pages/Library'));
const Forum = lazy(() => import('./pages/Forum'));
const ForumPost = lazy(() => import('./pages/ForumPost'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Features = lazy(() => import('./pages/Features'));
const Specializations = lazy(() => import('./pages/Specializations'));
const Changelog = lazy(() => import('./pages/Changelog'));
const ArchivesPage = lazy(() => import('./pages/ArchivesPage'));
const AchievementShowcase = lazy(() => import('./pages/AchievementShowcase'));
const GithubCallback = lazy(() => import('./pages/GithubCallback'));

// Loading fallback while a route chunk loads
const RouteLoader = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest uppercase">Loading_Module...</span>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    return children;
};
const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/dashboard" />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" />;
    return children;
};

// Wrapper to conditionally render the Global Chatbot
const GlobalChatbotWrapper = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Only show if user is authenticated
    if (!user) return null;

    // Explicitly hide on specific public pages (even if logged in) and learning pages
    const hiddenPaths = ['/', '/login', '/register'];
    if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith('/learn/')) {
        return null;
    }

    return <NebulaChatbot />;
};

// Global Reward Manager Component
const GlobalRewardManager = () => {
    const { reward, clearReward, unitReward, clearUnitReward } = useProgress();
    return (
        <>
            <RewardOverlay reward={reward} onClose={clearReward} />
            <UnitAchievementCard unitData={unitReward} onClose={clearUnitReward} />
        </>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotesProvider>
                    <ProgressProvider>
                        <GlobalChatbotWrapper />
                        <GlobalRewardManager />
                        <ErrorBoundary>
                            <Suspense fallback={<RouteLoader />}>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<LandingPage />} />
                                    <Route path="/auth/github/callback" element={<GithubCallback />} />
                                    <Route path="/showcase" element={<AchievementShowcase />} />
                                    <Route path="/login" element={
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    } />
                                    <Route path="/register" element={
                                        <PublicRoute>
                                            <Register />
                                        </PublicRoute>
                                    } />
                                    <Route path="/verify-email" element={<EmailVerification />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="/features" element={<Features />} />

                                    {/* Admin Routes */}
                                    <Route path="/admin/access" element={
                                        <ProtectedRoute>
                                            <AdminAccess />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/admin" element={
                                        <AdminRoute>
                                            <AdminDashboard />
                                        </AdminRoute>
                                    } />
                                    <Route path="/admin/regex" element={
                                        <AdminRoute>
                                            <AdminRegexPlayground />
                                        </AdminRoute>
                                    } />

                                    {/* Course Syllabus - shows all units/lessons */}
                                    <Route path="/course/:courseId" element={
                                        <ProtectedRoute>
                                            <CourseSyllabus />
                                        </ProtectedRoute>
                                    } />

                                    {/* Learning Environment - specific lesson/quiz/project */}
                                    <Route path="/learn/:courseId/:itemId" element={
                                        <ProtectedRoute>
                                            <LearningLayout />
                                        </ProtectedRoute>
                                    } />

                                    {/* Legacy route - redirect to syllabus */}
                                    <Route path="/learn/:courseId" element={
                                        <ProtectedRoute>
                                            <CourseSyllabus />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/profile" element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/dashboard" element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } />

                                    {/* Library */}
                                    <Route path="/resources" element={
                                        <ProtectedRoute>
                                            <Library />
                                        </ProtectedRoute>
                                    } />

                                    {/* Neural Vault (Archives) */}
                                    <Route path="/archives" element={
                                        <ProtectedRoute>
                                            <ArchivesPage />
                                        </ProtectedRoute>
                                    } />

                                    {/* Forum */}
                                    <Route path="/community" element={
                                        <ProtectedRoute>
                                            <Forum />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/forum/:postId" element={
                                        <ProtectedRoute>
                                            <ForumPost />
                                        </ProtectedRoute>
                                    } />

                                    {/* Changelog */}
                                    <Route path="/updates" element={
                                        <ProtectedRoute>
                                            <Changelog />
                                        </ProtectedRoute>
                                    } />

                                    {/* Leaderboard */}
                                    <Route path="/leaderboard" element={
                                        <ProtectedRoute>
                                            <Leaderboard />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/specializations" element={
                                        <ProtectedRoute>
                                            <Specializations />
                                        </ProtectedRoute>
                                    } />

                                    {/* Catch all */}
                                    <Route path="*" element={<Navigate to="/" />} />
                                </Routes>
                            </Suspense>
                        </ErrorBoundary>
                    </ProgressProvider>
                </NotesProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
