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

    const { code } = req.body || {};

    if (!code) {
        return res.status(400).json({ success: false, error: 'Missing authorization code' });
    }

    try {
        // Exchange code for token server-side (keeps client secret safe)
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

        // Fetch user profile
        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
        });
        if (!userResponse.ok) {
            return res.status(401).json({ success: false, error: 'Failed to fetch GitHub profile' });
        }
        const profile = await userResponse.json();

        // Fetch email if not public
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

        // Check if user exists by GitHub ID first, then email
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

        // Update streak on login
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
