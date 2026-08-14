import { sql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const user = await requireAdmin(req, res);
    if (!user) return;

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

        // Activity feed
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
