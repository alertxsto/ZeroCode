import { sql } from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';
import { rateLimitStrict } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!rateLimitStrict(req, res, () => {})) return;

    const user = await requireUser(req, res);
    if (!user) return;

    const { code } = req.body || {};

    if (!code) {
        return res.status(400).json({ success: false, error: 'Missing admin code' });
    }

    // Compare server-side against env secret (never shipped to the browser)
    if (code !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({ success: false, error: 'Invalid admin code' });
    }

    try {
        const result = await sql`
            UPDATE users
            SET is_admin = true, subscription_tier = 'admin'
            WHERE id = ${user.id}
            RETURNING id, email, name, phone, is_admin, subscription_tier, subscription_date, joined_date, is_email_verified, streak_count, last_activity
        `;

        return res.status(200).json({ success: true, user: result[0] });
    } catch (error) {
        console.error('Admin promote error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to promote user' });
    }
}
