import crypto from 'crypto';
import { sql } from './db.js';

// Hash a raw token so DB leaks never expose live session tokens
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const SESSION_TTL_DAYS = parseInt(process.env.SESSION_TTL_DAYS || '30', 10);

// Column list is a hardcoded constant (not user input), safe to inline via sql.unsafe
const USER_SELECT_COLUMNS = [
    'id', 'email', 'name', 'phone', 'avatar', 'border', 'is_admin', 'subscription_tier',
    'subscription_date', 'joined_date', 'created_at', 'streak_count', 'last_activity',
    'is_email_verified'
].map((c) => `u.${c}`).join(', ');

// Create a session for a user; returns the raw token (client keeps this, DB stores the hash)
export async function createSession(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    // Opportunistically clear expired sessions for this user
    await sql`DELETE FROM sessions WHERE user_id = ${userId} AND expires_at < NOW()`;

    await sql`
        INSERT INTO sessions (user_id, token_hash, expires_at)
        VALUES (${userId}, ${hashToken(token)}, ${expiresAt})
    `;

    return token;
}

// Resolve a Bearer token to a fresh user row (without password_hash), or null.
// Touches last_used_at so idle sessions can be pruned later.
export async function getUserFromRequest(req) {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) return null;

    const tokenHash = hashToken(token);

    try {
        const rows = await sql`
            SELECT ${sql.unsafe(USER_SELECT_COLUMNS)}
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ${tokenHash} AND s.expires_at > NOW()
            LIMIT 1
        `;

        if (rows.length === 0) return null;

        // Refresh last_used_at (fire and forget; failure is not fatal)
        sql`UPDATE sessions SET last_used_at = NOW() WHERE token_hash = ${tokenHash}`.catch(() => {});

        return rows[0];
    } catch (error) {
        console.error('Session lookup error:', error);
        return null;
    }
}

// Middleware-style helpers
export async function requireUser(req, res) {
    const user = await getUserFromRequest(req);
    if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return null;
    }
    return user;
}

export async function requireAdmin(req, res) {
    const user = await requireUser(req, res);
    if (!user) return null;
    if (!user.is_admin) {
        res.status(403).json({ success: false, error: 'Forbidden' });
        return null;
    }
    return user;
}

// Invalidate a session (logout)
export async function deleteSession(req) {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) return;
    await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`.catch(() => {});
}
