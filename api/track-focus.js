import { sql } from './_lib/db.js';
import { requireUser } from './_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await requireUser(req, res);
    if (!user) return;

    try {
        const { minutes, type = 'lab' } = req.body;

        if (!minutes || minutes < 0 || minutes > 180) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        const elapsed = Math.floor(minutes);

        // Map content type to column name (whitelist, safe)
        const columnMap = {
            doc: 'focus_minutes_doc',
            lab: 'focus_minutes_lab',
            quiz: 'focus_minutes_quiz',
            project: 'focus_minutes_project'
        };

        const column = columnMap[type] || 'focus_minutes_lab';

        // userId comes from the session token, not the request body (prevents BOLA)
        await sql.unsafe(`
            UPDATE user_dashboard_stats 
            SET total_focus_minutes = total_focus_minutes + $1,
                ${column} = ${column} + $1,
                last_activity_at = NOW(),
                updated_at = NOW()
            WHERE user_id = $2
        `, [elapsed, user.id]);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Focus tracking error:', error);
        return res.status(500).json({ error: 'Failed to track focus time' });
    }
}
