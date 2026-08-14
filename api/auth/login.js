import { sql } from '../_lib/db.js';
import bcrypt from 'bcryptjs';
import { createSession } from '../_lib/auth.js';
import { rateLimitAuth } from '../_lib/rateLimit.js';

const SAFE_USER_COLUMNS = [
    'id', 'email', 'name', 'phone', 'avatar', 'border', 'is_admin', 'subscription_tier',
    'subscription_date', 'joined_date', 'created_at', 'streak_count', 'last_activity',
    'is_email_verified'
];

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!rateLimitAuth(req, res, () => {})) return;

    const { email, password } = req.body || {};

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
        for (const col of SAFE_USER_COLUMNS) {
            safeUser[col] = dbUser[col];
        }
        safeUser.streak_count = streakCount;
        safeUser.last_activity = lastActivity;

        return res.status(200).json({ success: true, token, user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
}
