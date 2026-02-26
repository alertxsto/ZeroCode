import { createContext, useContext, useState, useEffect } from 'react';
import { sql } from '../lib/neon';
import bcrypt from 'bcryptjs';
import { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../lib/emailService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Admin secret code - managed via environment variables
const ADMIN_SECRET_CODE = import.meta.env.VITE_ADMIN_SECRET_CODE;

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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionUser = localStorage.getItem('zerocode_user');
        if (sessionUser) {
            try {
                setUser(JSON.parse(sessionUser));
            } catch (e) {
                localStorage.removeItem('zerocode_user');
            }
        }
        setLoading(false);
    }, []);

    const register = async (userData, password) => {
        try {
            const passwordHash = await bcrypt.hash(password, 10);

            // Using explicit or basic column names for the RETURNING clause
            // to avoid failing if non-critical columns (like avatar/phone) are missing
            const result = await sql`
                INSERT INTO users (email, password_hash, name, is_admin, subscription_tier)
                VALUES (${userData.email}, ${passwordHash}, ${userData.name}, false, 'free')
                RETURNING id, email, name, is_admin, subscription_tier, joined_date, created_at
            `;

            const newUser = result[0];
            localStorage.setItem('zerocode_user', JSON.stringify(newUser));
            setUser(newUser);

            return { success: true };
        } catch (error) {
            console.error('Registration error detailing:', {
                message: error.message,
                code: error.code,
                name: error.name,
                stack: error.stack
            });

            if (error.message.includes('duplicate key')) {
                return { success: false, error: 'Email already registered' };
            }
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                return { success: false, error: `Database Schema Error: ${error.message}. Please run the migration script.` };
            }
            return { success: false, error: error.message || 'An unexpected database error occurred' };
        }
    };

    const login = async (email, password) => {
        try {
            const result = await sql`
                SELECT id, email, password_hash, name, phone, avatar, border, is_admin, subscription_tier, subscription_date, joined_date, created_at, streak_count, last_activity
                FROM users WHERE email = ${email}
            `;

            if (result.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const dbUser = result[0];
            const isValid = await bcrypt.compare(password, dbUser.password_hash);
            if (!isValid) {
                return { success: false, error: 'Invalid password' };
            }

            const { password_hash, ...userWithoutPassword } = dbUser;

            // Auto-update streak on login
            const streakResult = await updateStreak(dbUser);
            if (streakResult.success) {
                userWithoutPassword.streak_count = streakResult.newStreak;
                userWithoutPassword.last_activity = streakResult.lastActivity;
            }

            localStorage.setItem('zerocode_user', JSON.stringify(userWithoutPassword));
            setUser(userWithoutPassword);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        localStorage.removeItem('zerocode_user');
        setUser(null);
    };

    const updateUser = async (updates) => {
        try {
            const result = await sql`
                UPDATE users
                SET name = ${updates.name || user.name}, 
                    phone = ${updates.phone || user.phone || null},
                    avatar = ${updates.avatar || user.avatar || null},
                    border = ${updates.border || user.border || null}
                WHERE id = ${user.id}
                RETURNING id, email, name, phone, avatar, border, is_admin, subscription_tier, subscription_date, joined_date, created_at, streak_count, last_activity
            `;

            const updatedUser = result[0];
            localStorage.setItem('zerocode_user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return { success: true };
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, error: error.message };
        }
    };

    const refreshUser = async () => {
        if (!user?.id) return;

        try {
            const result = await sql`
                SELECT id, email, name, phone, avatar, border, is_admin, subscription_tier, subscription_date, joined_date, created_at, streak_count, last_activity
                FROM users WHERE id = ${user.id}
            `;

            if (result.length > 0) {
                localStorage.setItem('zerocode_user', JSON.stringify(result[0]));
                setUser(result[0]);
            }
        } catch (error) {
            console.error('Refresh error:', error);
        }
    };

    const verifyAdminCode = async (code) => {
        if (code !== ADMIN_SECRET_CODE) {
            return { success: false, error: 'Invalid admin code' };
        }

        if (!user?.id) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const result = await sql`
                UPDATE users
                SET is_admin = true, subscription_tier = 'admin'
                WHERE id = ${user.id}
                RETURNING id, email, name, phone, is_admin, subscription_tier, subscription_date, joined_date
            `;

            const updatedUser = result[0];
            localStorage.setItem('zerocode_user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getAllUsers = async (search = '') => {
        if (!user?.is_admin) return { success: false, error: 'Unauthorized' };

        try {
            let result;
            if (search) {
                const searchPattern = `%${search}%`;
                result = await sql`
                    SELECT id, email, name, phone, is_admin, subscription_tier, subscription_date, joined_date
                    FROM users 
                    WHERE email ILIKE ${searchPattern} OR name ILIKE ${searchPattern}
                    ORDER BY joined_date DESC
                `;
            } else {
                result = await sql`
                    SELECT id, email, name, phone, is_admin, subscription_tier, subscription_date, joined_date
                    FROM users 
                    ORDER BY joined_date DESC
                `;
            }
            return { success: true, users: result };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message };
        }
    };

    const updateUserSubscription = async (userId, newTier) => {
        if (!user?.is_admin) return { success: false, error: 'Unauthorized' };

        try {
            const isAdmin = newTier === 'admin';
            const result = await sql`
                UPDATE users
                SET subscription_tier = ${newTier}, 
                    subscription_date = CURRENT_TIMESTAMP, 
                    is_admin = ${isAdmin}
                WHERE id = ${userId}
                RETURNING id, email, name, subscription_tier, is_admin, subscription_date
            `;

            if (result.length === 0) {
                return { success: false, error: 'User not found' };
            }

            // If updating current logged-in user, refresh their session
            if (userId === user.id) {
                const refreshed = { ...user, ...result[0] };
                localStorage.setItem('zerocode_user', JSON.stringify(refreshed));
                setUser(refreshed);
            }

            return { success: true, user: result[0] };
        } catch (error) {
            console.error('Error updating subscription:', error);
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async (googleData) => {
        try {
            let googleUser;

            // Check if input is a JWT string (from legacy GoogleLogin) or Profile Object (from useGoogleLogin)
            if (typeof googleData === 'string') {
                // Decode JWT token to get user info
                const base64Url = googleData.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                googleUser = JSON.parse(jsonPayload);
            } else {
                // Assume it's already a profile object from UserInfo endpoint
                googleUser = googleData;
            }

            const { email, name, sub: googleId, picture } = googleUser;

            // Check if user exists
            let result = await sql`
                SELECT id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar
                FROM users WHERE email = ${email}
            `;

            let dbUser;
            if (result.length === 0) {
                // Create new user from Google
                const verificationCode = generateVerificationCode();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

                const createResult = await sql`
                    INSERT INTO users (email, name, google_id, subscription_tier, email_verification_code, email_verification_expires, avatar, is_email_verified)
                    VALUES (${email}, ${name}, ${googleId}, 'free', ${verificationCode}, ${expiresAt}, ${picture}, true)
                    RETURNING id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar
                `;

                dbUser = createResult[0];

                // Auto-verify likely trusted, but logic kept as is in original for Google
            } else {
                dbUser = result[0];

                // Link Google ID if not present
                if (!dbUser.google_id) {
                    await sql`UPDATE users SET google_id = ${googleId} WHERE id = ${dbUser.id}`;
                }
            }

            localStorage.setItem('zerocode_user', JSON.stringify(dbUser));
            setUser(dbUser);

            // Update Streak
            await updateStreak(dbUser);

            return { success: true, user: dbUser };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: error.message };
        }
    };

    const loginWithGithub = async (githubProfile) => {
        try {
            const { email, name, id: githubId, avatar_url, login } = githubProfile;
            const displayName = name || login;
            const primaryEmail = email; // Note: GitHub API might not return email if private, requires checking emails endpoint

            if (!primaryEmail && !githubId) {
                return { success: false, error: 'Could not retrieve email or ID from GitHub' };
            }

            // Check if user exists by GitHub ID first, then Email
            let result = await sql`
                SELECT id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar, github_id
                FROM users 
                WHERE github_id = ${String(githubId)} 
                OR (email = ${primaryEmail} AND email IS NOT NULL)
            `;

            let dbUser;
            if (result.length === 0) {
                // New User
                const verificationCode = generateVerificationCode();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

                const createResult = await sql`
                    INSERT INTO users (email, name, github_id, subscription_tier, email_verification_code, email_verification_expires, avatar, is_email_verified)
                    VALUES (${primaryEmail || `github_${githubId}@placeholder.com`}, ${displayName}, ${String(githubId)}, 'free', ${verificationCode}, ${expiresAt}, ${avatar_url}, ${!!primaryEmail})
                    RETURNING id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar, github_id
                `;
                dbUser = createResult[0];

            } else {
                dbUser = result[0];

                // Link GitHub ID if missing
                if (!dbUser.github_id) {
                    await sql`UPDATE users SET github_id = ${String(githubId)} WHERE id = ${dbUser.id}`;
                    dbUser.github_id = String(githubId);
                }

                // Update Avatar if missing
                if (!dbUser.avatar && avatar_url) {
                    await sql`UPDATE users SET avatar = ${avatar_url} WHERE id = ${dbUser.id}`;
                    dbUser.avatar = avatar_url;
                }
            }

            localStorage.setItem('zerocode_user', JSON.stringify(dbUser));
            setUser(dbUser);

            // Update Streak
            await updateStreak(dbUser);

            return { success: true, user: dbUser };

        } catch (error) {
            console.error('GitHub login error:', error);
            return { success: false, error: error.message };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const result = await sql`
                SELECT id, email_verification_code, email_verification_expires, is_email_verified
                FROM users WHERE email = ${email}
            `;

            if (result.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const dbUser = result[0];

            // Check if already verified
            if (dbUser.is_email_verified) {
                return { success: true, message: 'Email already verified' };
            }

            // Check if code matches
            if (dbUser.email_verification_code !== code) {
                return { success: false, error: 'Invalid verification code' };
            }

            // Check if code expired
            if (new Date() > new Date(dbUser.email_verification_expires)) {
                return { success: false, error: 'Verification code expired' };
            }

            // Mark as verified
            const updateResult = await sql`
                UPDATE users
                SET is_email_verified = true, email_verification_code = NULL, email_verification_expires = NULL
                WHERE email = ${email}
                RETURNING id, email, name, is_admin, subscription_tier, is_email_verified, joined_date
            `;

            const verifiedUser = updateResult[0];
            localStorage.setItem('zerocode_user', JSON.stringify(verifiedUser));
            setUser(verifiedUser);

            // Send welcome email
            await sendWelcomeEmail(email, verifiedUser.name);

            return { success: true, user: verifiedUser };
        } catch (error) {
            console.error('Verification error:', error);
            return { success: false, error: error.message };
        }
    };

    const resendVerificationCode = async (email) => {
        try {
            const result = await sql`
                SELECT id, name FROM users WHERE email = ${email}
            `;

            if (result.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const verificationCode = generateVerificationCode();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await sql`
                UPDATE users
                SET email_verification_code = ${verificationCode}, email_verification_expires = ${expiresAt}
                WHERE email = ${email}
            `;

            await sendVerificationEmail(email, verificationCode);

            return { success: true, message: 'Verification code sent' };
        } catch (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const result = await sql`
                SELECT id, name FROM users WHERE email = ${email}
            `;

            if (result.length === 0) {
                return { success: true, message: 'If email exists, reset code sent' };
            }

            const resetCode = generateVerificationCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await sql`
                UPDATE users
                SET password_reset_code = ${resetCode}, password_reset_expires = ${expiresAt}
                WHERE email = ${email}
            `;

            await sendPasswordResetEmail(email, resetCode);

            return { success: true, message: 'Reset link sent to email' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (email, code, newPassword) => {
        try {
            const result = await sql`
                SELECT id, password_reset_code, password_reset_expires
                FROM users WHERE email = ${email}
            `;

            if (result.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const user = result[0];

            if (user.password_reset_code !== code) {
                return { success: false, error: 'Invalid reset code' };
            }

            if (new Date() > new Date(user.password_reset_expires)) {
                return { success: false, error: 'Reset code expired' };
            }

            const passwordHash = await bcrypt.hash(newPassword, 10);

            await sql`
                UPDATE users
                SET password_hash = ${passwordHash}, password_reset_code = NULL, password_reset_expires = NULL
                WHERE id = ${user.id}
            `;

            return { success: true, message: 'Password reset successfully' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    };

    const getLeaderboard = async () => {
        try {
            const result = await sql`
                SELECT id, name, email, points, courses_completed, avatar, border
                FROM users
                WHERE points > 0 OR courses_completed > 0
                ORDER BY points DESC, courses_completed DESC
                LIMIT 100
            `;

            let userRank = null;
            if (user?.id) {
                const userResult = await sql`
                    SELECT points, courses_completed
                    FROM users
                    WHERE id = ${user.id}
                `;

                if (userResult.length > 0) {
                    const userStats = userResult[0];
                    const rankResult = await sql`
                        SELECT COUNT(*) as rank
                        FROM users
                        WHERE points > ${userStats.points}
                        OR (points = ${userStats.points} AND courses_completed > ${userStats.courses_completed})
                    `;

                    userRank = {
                        rank: rankResult[0].rank + 1,
                        points: userStats.points || 0,
                        coursesCompleted: userStats.courses_completed || 0
                    };
                }
            }

            return { success: true, leaderboard: result, userRank };
        } catch (error) {
            console.error('Leaderboard error:', error);
            return { success: false, error: error.message };
        }
    };

    const updateLeaderboardStats = async (points, coursesCompleted) => {
        if (!user?.id) return { success: false, error: 'Not logged in' };

        try {
            await sql`
                UPDATE users
                SET points = ${points},
                    courses_completed = ${coursesCompleted}
                WHERE id = ${user.id}
            `;
            return { success: true };
        } catch (error) {
            console.error('Error updating leaderboard stats:', error);
            return { success: false, error: error.message };
        }
    };

    const updateStreak = async (targetUser = user) => {
        if (!targetUser?.id) return { success: false };

        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            // Get current streak data
            const [dbUser] = await sql`
                SELECT streak_count, last_activity AT TIME ZONE 'UTC' as last_activity
                FROM users WHERE id = ${targetUser.id}
            `;

            let newStreak = dbUser.streak_count || 0;
            const lastActivityDate = dbUser.last_activity
                ? new Date(dbUser.last_activity).toISOString().split('T')[0]
                : null;

            if (!lastActivityDate) {
                // First activity ever
                newStreak = 1;
            } else if (lastActivityDate === today) {
                // Already updated today, keep as is
                return { success: true, newStreak, lastActivity: dbUser.last_activity };
            } else {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastActivityDate === yesterdayStr) {
                    // Continued streak
                    newStreak += 1;
                } else {
                    // Streak broken
                    newStreak = 1;
                }
            }

            await sql`
                UPDATE users
                SET streak_count = ${newStreak},
                    last_activity = CURRENT_TIMESTAMP
                WHERE id = ${targetUser.id}
            `;

            return { success: true, newStreak, lastActivity: now };
        } catch (error) {
            console.error('Error updating streak:', error);
            return { success: false, error: error.message };
        }
    };

    const getAdminAnalytics = async () => {
        if (!user?.is_admin) return { success: false, error: 'Unauthorized' };

        try {
            // Tier Distribution
            const tierDistribution = await sql`
                SELECT subscription_tier, COUNT(*) as count 
                FROM users 
                GROUP BY subscription_tier
            `;

            // Signup trend (last 7 days)
            const signupTrend = await sql`
                SELECT DATE(joined_date) as date, COUNT(*) as count 
                FROM users 
                WHERE joined_date > CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(joined_date)
                ORDER BY DATE(joined_date) ASC
            `;

            // Popular Courses
            const popularCourses = await sql`
                SELECT course_id, COUNT(*) as enrollments 
                FROM course_progress 
                GROUP BY course_id 
                ORDER BY enrollments DESC 
                LIMIT 5
            `;

            return {
                success: true,
                analytics: {
                    tierDistribution,
                    signupTrend,
                    popularCourses
                }
            };
        } catch (error) {
            console.error('Analytics error:', error);
            return { success: false, error: error.message };
        }
    };

    const getAdminActivity = async () => {
        if (!user?.is_admin) return { success: false, error: 'Unauthorized' };

        try {
            // Since we don't have a centralized logs table, we aggregate latest events
            const latestUsers = await sql`
                SELECT id, name, email, joined_date as timestamp, 'USER_JOINED' as type 
                FROM users 
                ORDER BY joined_date DESC 
                LIMIT 10
            `;

            const latestProgress = await sql`
                SELECT cp.id, u.name as user_name, cp.course_id, cp.updated_at as timestamp, 'COURSE_PROGRESS' as type 
                FROM course_progress cp
                JOIN users u ON cp.user_id = u.id
                ORDER BY cp.updated_at DESC 
                LIMIT 10
            `;

            const latestPosts = await sql`
                SELECT fp.id, u.name as user_name, fp.title, fp.created_at as timestamp, 'FORUM_POST' as type 
                FROM forum_posts fp
                JOIN users u ON fp.user_id = u.id
                ORDER BY fp.created_at DESC 
                LIMIT 10
            `;

            const combined = [...latestUsers, ...latestProgress, ...latestPosts]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 20);

            return { success: true, activity: combined };
        } catch (error) {
            console.error('Activity logs error:', error);
            return { success: false, error: error.message };
        }
    };

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
        getAllUsers,
        updateUserSubscription,
        loginWithGoogle,
        loginWithGithub,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        getLeaderboard,
        updateLeaderboardStats,
        getAdminAnalytics,
        getAdminActivity,
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
