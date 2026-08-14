import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = await requireAdmin(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const search = req.query.search || '';
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
            return res.status(200).json({ success: true, users: result });
        } catch (error) {
            console.error('Admin list users error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        const { userId, tier } = req.body || {};

        if (!userId || !tier) {
            return res.status(400).json({ success: false, error: 'Missing userId or tier' });
        }

        try {
            const isAdmin = tier === 'admin';
            const result = await sql`
                UPDATE users
                SET subscription_tier = ${tier}, 
                    subscription_date = CURRENT_TIMESTAMP, 
                    is_admin = ${isAdmin}
                WHERE id = ${userId}
                RETURNING id, email, name, subscription_tier, is_admin, subscription_date
            `;

            if (result.length === 0) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            return res.status(200).json({ success: true, user: result[0] });
        } catch (error) {
            console.error('Admin update subscription error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
