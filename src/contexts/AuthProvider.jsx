import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getToken, setToken, clearToken } from '../lib/apiClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Subscription tier access levels
export const SUBSCRIPTION_TIERS = {
    free: {
        label: 'Free',
        courses: ['html5', 'css3', 'js-basics'], // Demo courses only
        color: 'gray'
    },
    beginner: {
        label: 'Beginner',
        courses: ['html5', 'css3', 'js-basics', 'git', 'tailwind'],
        color: 'blue'
    },
    intermediate: {
        label: 'Intermediate',
        courses: ['html5', 'css3', 'js-basics', 'git', 'tailwind', 'dom', 'js-es6', 'react', 'php', 'mysql', 'python'],
        color: 'purple'
    },
    advanced: {
        label: 'Advanced',
        courses: 'all',
        color: 'red'
    },
    fullstack: {
        label: 'Fullstack',
        courses: 'all',
        color: 'green'
    },
    admin: {
        label: 'Admin',
        courses: 'all',
        color: 'yellow'
    }
};

// Check if user can access a course
export const canAccessCourse = (userTier, courseId) => {
    if (!userTier) return false;

    const tier = SUBSCRIPTION_TIERS[userTier];
    if (!tier) return false;

    // Admin, fullstack, advanced have access to all
    if (tier.courses === 'all') return true;

    // Check if course is in allowed list
    return tier.courses.includes(courseId);
};

const USER_KEY = 'zerocode_user';

const persistUser = (user) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const token = getToken();
        const sessionUser = localStorage.getItem(USER_KEY);

        if (token && sessionUser) {
            try {
                setUser(JSON.parse(sessionUser));
            } catch {
                clearToken();
                localStorage.removeItem(USER_KEY);
            }
        } else {
            clearToken();
            localStorage.removeItem(USER_KEY);
        }

        // Validate the session server-side in the background
        const validateSession = async () => {
            if (!getToken()) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiFetch('/api/auth?action=me');
                persistUser(data.user);
                setUser(data.user);
            } catch {
                clearToken();
                localStorage.removeItem(USER_KEY);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        validateSession();
    }, []);

    const register = async (userData, password) => {
        try {
            const data = await apiFetch('/api/auth?action=register', {
                method: 'POST',
                auth: false,
                body: { email: userData.email, password, name: userData.name }
            });
            setToken(data.token);
            persistUser(data.user);
            setUser(data.user);
            return { success: true, user: data.user, needsVerification: !data.user?.is_email_verified };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            const data = await apiFetch('/api/auth?action=login', {
                method: 'POST',
                auth: false,
                body: { email, password }
            });
            setToken(data.token);
            persistUser(data.user);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await apiFetch('/api/auth?action=logout', { method: 'POST' });
        } catch {
            // Ignore logout API errors — always clear local session
        }
        clearToken();
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    const updateUser = async (updates) => {
        try {
            const data = await apiFetch('/api/profile', {
                method: 'PATCH',
                body: updates
            });
            persistUser(data.user);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const refreshUser = async () => {
        if (!getToken()) return;
        try {
            const data = await apiFetch('/api/auth?action=me');
            persistUser(data.user);
            setUser(data.user);
        } catch (error) {
            console.error('Refresh error:', error);
        }
    };

    const verifyAdminCode = async (code) => {
        try {
            const data = await apiFetch('/api/admin?action=promote', {
                method: 'POST',
                body: { code }
            });
            persistUser(data.user);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const data = await apiFetch('/api/auth?action=verify-email', {
                method: 'POST',
                auth: false,
                body: { email, code }
            });
            // Verification creates a fresh session
            if (data.token) setToken(data.token);
            const me = await apiFetch('/api/auth?action=me');
            persistUser(me.user);
            setUser(me.user);
            return { success: true, user: me.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resendVerificationCode = async (email) => {
        try {
            const data = await apiFetch('/api/auth?action=resend-code', {
                method: 'POST',
                auth: false,
                body: { email }
            });
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const data = await apiFetch('/api/auth?action=request-password-reset', {
                method: 'POST',
                auth: false,
                body: { email }
            });
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (email, code, newPassword) => {
        try {
            const data = await apiFetch('/api/auth?action=reset-password', {
                method: 'POST',
                auth: false,
                body: { email, code, newPassword }
            });
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async (userInfo) => {
        try {
            // userInfo is the profile from Google's userinfo endpoint;
            // the server verifies the access token itself, so we pass the raw token
            const accessToken = userInfo.access_token;
            if (!accessToken) {
                return { success: false, error: 'Missing Google access token' };
            }
            const data = await apiFetch('/api/auth?action=google', {
                method: 'POST',
                auth: false,
                body: { accessToken }
            });
            setToken(data.token);
            persistUser(data.user);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const loginWithGithub = async (githubProfile) => {
        // GitHub flow now exchanges the code server-side via /api/auth?action=github.
        // This method receives the raw OAuth code.
        try {
            if (typeof githubProfile === 'string') {
                // Called with just the code from GithubCallback
                const data = await apiFetch('/api/auth?action=github', {
                    method: 'POST',
                    auth: false,
                    body: { code: githubProfile }
                });
                setToken(data.token);
                persistUser(data.user);
                setUser(data.user);
                return { success: true, user: data.user };
            }
            return { success: false, error: 'Invalid GitHub login payload' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getLeaderboard = async () => {
        try {
            const data = await apiFetch('/api/leaderboard');
            return { success: true, leaderboard: data.leaderboard, userRank: data.userRank };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateLeaderboardStats = useCallback(async () => {
        // Leaderboard sync is derived server-side from item_progress / course_progress.
        // Kept as a no-op so existing callers keep working; real stats come from /api/progress.
    }, []);

    const updateStreak = useCallback(async (targetUser) => {
        // Streak is computed server-side on login and item completion.
        // Kept as a no-op for callers that still invoke it; the returned shape
        // mirrors the old client-side behavior.
        const now = new Date();
        return { success: true, newStreak: targetUser?.streak_count || user?.streak_count || 0, lastActivity: now };
    }, [user]);

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
        refreshUser,
        signOut: logout,
        verifyAdminCode,
        loginWithGoogle,
        loginWithGithub,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        getLeaderboard,
        updateLeaderboardStats,
        updateStreak,
        canAccessCourse: (courseId) => canAccessCourse(user?.subscription_tier, courseId),
        isAdmin: user?.is_admin || false,
        subscriptionTier: user?.subscription_tier || 'free',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
