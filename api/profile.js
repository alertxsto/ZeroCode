import { sql } from './_lib/db.js';
import { requireUser } from './_lib/auth.js';

const SAFE_USER_COLUMNS = [
    'id', 'email', 'name', 'phone', 'avatar', 'border', 'is_admin', 'subscription_tier',
    'subscription_date', 'joined_date', 'created_at', 'streak_count', 'last_activity',
    'is_email_verified'
].join(', ');

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === 'PATCH') {
        const { name, phone, avatar, border } = req.body || {};

        try {
            const result = await sql`
                UPDATE users
                SET name = ${name ?? user.name}, 
                    phone = ${phone ?? user.phone ?? null},
                    avatar = ${avatar ?? user.avatar ?? null},
                    border = ${border ?? user.border ?? null}
                WHERE id = ${user.id}
                RETURNING ${sql.unsafe(SAFE_USER_COLUMNS)}
            `;

            return res.status(200).json({ success: true, user: result[0] });
        } catch (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
