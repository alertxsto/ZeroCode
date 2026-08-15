// Consolidated auth endpoints via dynamic route:
//   /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me,
//   /api/auth/verify-email, /api/auth/resend-code, /api/auth/google,
//   /api/auth/github, /api/auth/request-password-reset, /api/auth/reset-password
// Consolidates 10 serverless functions into 1 (Vercel Hobby 12-fn limit).

import { sql } from '../../shared/_lib/db.js';
import bcrypt from 'bcryptjs';
import { generateVerificationCode } from '../../src/lib/emailService.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../../shared/_lib/email.js';
import { createSession, deleteSession, requireUser } from '../../shared/_lib/auth.js';
import { rateLimitAuth, rateLimitStrict } from '../../shared/_lib/rateLimit.js';

const SAFE_USER_COLUMNS = [
    'id', 'email', 'name', 'phone', 'avatar', 'border', 'is_admin', 'subscription_tier',
    'subscription_date', 'joined_date', 'created_at', 'streak_count', 'last_activity',
    'is_email_verified'
];

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const action = req.query.action;
    const body = req.body || {};

    // Log method + action for debugging proxy behavior
    console.log(`[auth] method=${req.method} action=${action}`);

    switch (action) {
        case 'register':
            return handleRegister(req, res, body);
        case 'login':
            return handleLogin(req, res, body);
        case 'logout':
            return handleLogout(req, res);
        case 'me':
            return handleMe(req, res);
        case 'verify-email':
            return handleVerifyEmail(req, res, body);
        case 'resend-code':
            return handleResendCode(req, res, body);
        case 'google':
            return handleGoogle(req, res, body);
        case 'github':
            return handleGithub(req, res, body);
        case 'request-password-reset':
            return handleRequestPasswordReset(req, res, body);
        case 'reset-password':
            return handleResetPassword(req, res, body);
        default:
            return res.status(404).json({ success: false, error: 'Unknown action' });
    }
}

// ---------- register ----------

async function handleRegister(req, res, { email, password, name }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitAuth(req, res, () => {})) return;

    if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const result = await sql`
            INSERT INTO users (email, password_hash, name, is_admin, subscription_tier, email_verification_code, email_verification_expires)
            VALUES (${email.toLowerCase()}, ${passwordHash}, ${name}, false, 'free', ${verificationCode}, ${expiresAt})
            RETURNING id, email, name, is_admin, subscription_tier, joined_date, created_at, is_email_verified
        `;

        await sendVerificationEmail(email.toLowerCase(), verificationCode).catch(() => {});

        const token = await createSession(result[0].id);
        const safeUser = {};
        for (const col of SAFE_USER_COLUMNS) safeUser[col] = result[0][col];

        return res.status(201).json({ success: true, token, user: safeUser });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message && error.message.includes('duplicate key')) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }
        return res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
}

// ---------- login ----------

async function handleLogin(req, res, { email, password }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitAuth(req, res, () => {})) return;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    try {
        const result = await sql`
            SELECT id, email, password_hash, name, phone, avatar, border, is_admin, subscription_tier, subscription_date, joined_date, created_at, streak_count, last_activity, is_email_verified
            FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const dbUser = result[0];
        const isValid = await bcrypt.compare(password, dbUser.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Auto-update streak on login
        let streakCount = dbUser.streak_count || 0;
        let lastActivity = dbUser.last_activity;
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = lastActivity ? new Date(lastActivity).toISOString().split('T')[0] : null;
        if (!lastActivityDate || lastActivityDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            streakCount = lastActivityDate === yesterday ? streakCount + 1 : 1;
            lastActivity = new Date();
            await sql`
                UPDATE users SET streak_count = ${streakCount}, last_activity = CURRENT_TIMESTAMP
                WHERE id = ${dbUser.id}
            `;
        }

        const token = await createSession(dbUser.id);

        const safeUser = {};
        for (const col of SAFE_USER_COLUMNS) safeUser[col] = dbUser[col];
        safeUser.streak_count = streakCount;
        safeUser.last_activity = lastActivity;

        return res.status(200).json({ success: true, token, user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
}

// ---------- logout ----------

async function handleLogout(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    try {
        await deleteSession(req);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ success: false, error: 'Logout failed' });
    }
}

// ---------- me ----------

async function handleMe(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
    const user = await requireUser(req, res);
    if (!user) return;
    return res.status(200).json({ success: true, user });
}

// ---------- verify-email ----------

async function handleVerifyEmail(req, res, { email, code }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitStrict(req, res, () => {})) return;

    if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Missing email or code' });
    }

    try {
        const result = await sql`
            SELECT id, email_verification_code, email_verification_expires, is_email_verified, name
            FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const dbUser = result[0];

        if (dbUser.is_email_verified) {
            return res.status(200).json({ success: true, message: 'Email already verified' });
        }

        if (dbUser.email_verification_code !== code) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        if (new Date() > new Date(dbUser.email_verification_expires)) {
            return res.status(400).json({ success: false, error: 'Verification code expired' });
        }

        await sql`
            UPDATE users
            SET is_email_verified = true, email_verification_code = NULL, email_verification_expires = NULL
            WHERE id = ${dbUser.id}
        `;

        await sendWelcomeEmail(email.toLowerCase(), dbUser.name).catch(() => {});

        const token = await createSession(dbUser.id);

        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Verification failed' });
    }
}

// ---------- resend-code ----------

async function handleResendCode(req, res, { email }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitAuth(req, res, () => {})) return;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Missing email' });
    }

    try {
        const result = await sql`
            SELECT id, name FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(200).json({ success: true, message: 'If email exists, a code was sent' });
        }

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await sql`
            UPDATE users
            SET email_verification_code = ${verificationCode}, email_verification_expires = ${expiresAt}
            WHERE email = ${email.toLowerCase()}
        `;

        await sendVerificationEmail(email.toLowerCase(), verificationCode).catch(() => {});

        return res.status(200).json({ success: true, message: 'Verification code sent' });
    } catch (error) {
        console.error('Resend code error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to resend code' });
    }
}

// ---------- google ----------

async function handleGoogle(req, res, { accessToken }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitAuth(req, res, () => {})) return;

    if (!accessToken) {
        return res.status(400).json({ success: false, error: 'Missing access token' });
    }

    try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
        if (!verifyRes.ok) {
            return res.status(401).json({ success: false, error: 'Invalid Google token' });
        }
        const tokenInfo = await verifyRes.json();

        const expectedAudience = process.env.VITE_GOOGLE_CLIENT_ID;
        if (expectedAudience && tokenInfo.aud && tokenInfo.aud !== expectedAudience) {
            return res.status(401).json({ success: false, error: 'Token audience mismatch' });
        }

        const email = (tokenInfo.email || '').toLowerCase();
        const name = tokenInfo.name || email.split('@')[0] || 'Google User';
        const googleId = tokenInfo.sub;
        const picture = tokenInfo.picture;

        if (!email || !googleId) {
            return res.status(400).json({ success: false, error: 'Google token missing email or subject' });
        }

        let result = await sql`
            SELECT id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar
            FROM users WHERE email = ${email}
        `;

        let dbUser;
        if (result.length === 0) {
            const createResult = await sql`
                INSERT INTO users (email, name, google_id, subscription_tier, avatar, is_email_verified)
                VALUES (${email}, ${name}, ${googleId}, 'free', ${picture}, true)
                RETURNING id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar
            `;
            dbUser = createResult[0];
        } else {
            dbUser = result[0];

            if (!dbUser.google_id) {
                await sql`UPDATE users SET google_id = ${googleId} WHERE id = ${dbUser.id}`;
            }
            if (!dbUser.avatar && picture) {
                await sql`UPDATE users SET avatar = ${picture} WHERE id = ${dbUser.id}`;
            }
        }

        await sql`
            UPDATE users SET streak_count = streak_count + 1, last_activity = CURRENT_TIMESTAMP
            WHERE id = ${dbUser.id}
            AND (last_activity IS NULL OR last_activity::date < CURRENT_DATE)
        `;

        const token = await createSession(dbUser.id);

        return res.status(200).json({ success: true, token, user: dbUser });
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Google login failed' });
    }
}

// ---------- github ----------

async function handleGithub(req, res, { code }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitAuth(req, res, () => {})) return;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Missing authorization code' });
    }

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.VITE_GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return res.status(401).json({ success: false, error: tokenData.error_description || 'Failed to exchange GitHub code' });
        }

        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
        });
        if (!userResponse.ok) {
            return res.status(401).json({ success: false, error: 'Failed to fetch GitHub profile' });
        }
        const profile = await userResponse.json();

        let email = profile.email;
        if (!email) {
            const emailRes = await fetch('https://api.github.com/user/emails', {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
            });
            if (emailRes.ok) {
                const emails = await emailRes.json();
                const primary = emails.find(e => e.primary && e.verified);
                if (primary) email = primary.email;
            }
        }

        const githubId = String(profile.id);
        const displayName = profile.name || profile.login || 'GitHub User';
        const primaryEmail = email ? email.toLowerCase() : null;

        if (!primaryEmail && !githubId) {
            return res.status(400).json({ success: false, error: 'Could not retrieve email or ID from GitHub' });
        }

        let result = await sql`
            SELECT id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar, github_id
            FROM users 
            WHERE github_id = ${githubId} 
            OR (email = ${primaryEmail} AND email IS NOT NULL)
        `;

        let dbUser;
        if (result.length === 0) {
            const createResult = await sql`
                INSERT INTO users (email, name, github_id, subscription_tier, avatar, is_email_verified)
                VALUES (${primaryEmail || `github_${githubId}@placeholder.com`}, ${displayName}, ${githubId}, 'free', ${profile.avatar_url}, ${!!primaryEmail})
                RETURNING id, email, name, is_admin, subscription_tier, is_email_verified, joined_date, avatar, github_id
            `;
            dbUser = createResult[0];
        } else {
            dbUser = result[0];

            if (!dbUser.github_id) {
                await sql`UPDATE users SET github_id = ${githubId} WHERE id = ${dbUser.id}`;
            }
            if (!dbUser.avatar && profile.avatar_url) {
                await sql`UPDATE users SET avatar = ${profile.avatar_url} WHERE id = ${dbUser.id}`;
            }
        }

        await sql`
            UPDATE users SET streak_count = streak_count + 1, last_activity = CURRENT_TIMESTAMP
            WHERE id = ${dbUser.id}
            AND (last_activity IS NULL OR last_activity::date < CURRENT_DATE)
        `;

        const token = await createSession(dbUser.id);

        return res.status(200).json({ success: true, token, user: dbUser });
    } catch (error) {
        console.error('GitHub login error:', error);
        return res.status(500).json({ success: false, error: error.message || 'GitHub login failed' });
    }
}

// ---------- request-password-reset ----------

async function handleRequestPasswordReset(req, res, { email }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitAuth(req, res, () => {})) return;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Missing email' });
    }

    try {
        const result = await sql`
            SELECT id, name FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(200).json({ success: true, message: 'If email exists, reset code sent' });
        }

        const resetCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await sql`
            UPDATE users
            SET password_reset_code = ${resetCode}, password_reset_expires = ${expiresAt}
            WHERE email = ${email.toLowerCase()}
        `;

        await sendPasswordResetEmail(email.toLowerCase(), resetCode).catch(() => {});

        return res.status(200).json({ success: true, message: 'Reset link sent to email' });
    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to request reset' });
    }
}

// ---------- reset-password ----------

async function handleResetPassword(req, res, { email, code, newPassword }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitStrict(req, res, () => {})) return;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    try {
        const result = await sql`
            SELECT id, password_reset_code, password_reset_expires
            FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const user = result[0];

        if (user.password_reset_code !== code) {
            return res.status(400).json({ success: false, error: 'Invalid reset code' });
        }
        if (new Date() > new Date(user.password_reset_expires)) {
            return res.status(400).json({ success: false, error: 'Reset code expired' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await sql`
            UPDATE users
            SET password_hash = ${passwordHash}, password_reset_code = NULL, password_reset_expires = NULL
            WHERE id = ${user.id}
        `;

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
