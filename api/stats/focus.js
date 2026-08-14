import { sql } from '../_lib/db.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const user = await requireUser(req, res);
    if (!user) return;

    try {
        // Per-course breakdown scoped to the authenticated user (fixes BOLA)
        const result = await sql`
            SELECT course_id, unit_id, content_type, SUM(duration_minutes) as total_minutes
            FROM focus_time_log
            WHERE user_id = ${user.id}
            GROUP BY course_id, unit_id, content_type
            ORDER BY course_id, unit_id
        `;

        return res.status(200).json({ success: true, focusLog: result });
    } catch (error) {
        console.error('Focus stats error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
