// Consolidated admin endpoints via dynamic route:
//   /api/admin/users (GET list, PATCH tier), /api/admin/analytics (GET),
//   /api/admin/promote (POST)
// Consolidates 3 serverless functions into 1 (Vercel Hobby 12-fn limit).

import { sql } from '../shared/_lib/db.js';
import { requireAdmin, requireUser } from '../shared/_lib/auth.js';
import { rateLimitStrict } from '../shared/_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const action = req.query.action;
    const body = req.body || {};

    switch (action) {
        case 'users':
            return handleUsers(req, res, body);
        case 'analytics':
            return handleAnalytics(req, res);
        case 'promote':
            return handlePromote(req, res, body);
        default:
            return res.status(404).json({ success: false, error: 'Unknown action' });
    }
}

async function handleUsers(req, res, body) {
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
        const { userId, tier } = body;

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

async function handleAnalytics(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

    const user = await requireAdmin(req, res);
    if (!user) return;

    try {
        const tierDistribution = await sql`
            SELECT subscription_tier, COUNT(*) as count 
            FROM users 
            GROUP BY subscription_tier
        `;

        const signupTrend = await sql`
            SELECT DATE(joined_date) as date, COUNT(*) as count 
            FROM users 
            WHERE joined_date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(joined_date)
            ORDER BY DATE(joined_date) ASC
        `;

        const popularCourses = await sql`
            SELECT course_id, COUNT(*) as enrollments 
            FROM course_progress 
            GROUP BY course_id 
            ORDER BY enrollments DESC 
            LIMIT 5
        `;

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

        return res.status(200).json({
            success: true,
            analytics: {
                tierDistribution,
                signupTrend,
                popularCourses
            },
            activity: combined
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function handlePromote(req, res, { code }) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    if (!rateLimitStrict(req, res, () => {})) return;

    const user = await requireUser(req, res);
    if (!user) return;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Missing admin code' });
    }

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
