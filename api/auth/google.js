import { sql } from '../_lib/db.js';
import { createSession } from '../_lib/auth.js';
import { rateLimitAuth } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!rateLimitAuth(req, res, () => {})) return;

    const { accessToken } = req.body || {};

    if (!accessToken) {
        return res.status(400).json({ success: false, error: 'Missing access token' });
    }

    try {
        // Verify the token server-side with Google's tokeninfo endpoint
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
        if (!verifyRes.ok) {
            return res.status(401).json({ success: false, error: 'Invalid Google token' });
        }
        const tokenInfo = await verifyRes.json();

        // Ensure the token is for our app (audience check)
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

        // Check if user exists
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

            // Link Google ID if not present
            if (!dbUser.google_id) {
                await sql`UPDATE users SET google_id = ${googleId} WHERE id = ${dbUser.id}`;
            }
            // Update avatar if missing
            if (!dbUser.avatar && picture) {
                await sql`UPDATE users SET avatar = ${picture} WHERE id = ${dbUser.id}`;
            }
        }

        // Update streak on login
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
