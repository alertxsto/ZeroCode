// Consolidated stats endpoints via dynamic route:
//   /api/stats/focus (GET)
// Consolidates stats endpoints into 1 (Vercel Hobby 12-fn limit).

import { sql } from '../shared/_lib/db.js';
import { requireUser } from '../shared/_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const resource = req.query.resource;

    switch (resource) {
        case 'focus':
            return handleFocus(req, res);
        default:
            return res.status(404).json({ success: false, error: 'Unknown resource' });
    }
}

async function handleFocus(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

    const user = await requireUser(req, res);
    if (!user) return;

    try {
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
