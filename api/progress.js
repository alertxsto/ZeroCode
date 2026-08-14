import { sql } from './_lib/db.js';
import { requireUser } from './_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = await requireUser(req, res);
    if (!user) return;

    // GET /api/progress — load completed courses + items + focus stats
    if (req.method === 'GET') {
        try {
            const courses = await sql`
                SELECT course_id, version 
                FROM course_progress 
                WHERE user_id = ${user.id} AND completed = true
            `;

            const items = await sql`
                SELECT item_id, course_id, unit_id, completed_at
                FROM item_progress 
                WHERE user_id = ${user.id} AND completed = true
            `;

            let focusStats = null;
            try {
                const statsResult = await sql`
                    SELECT total_focus_minutes, focus_minutes_doc, focus_minutes_lab, focus_minutes_quiz, focus_minutes_project 
                    FROM user_dashboard_stats 
                    WHERE user_id = ${user.id}
                `;
                if (statsResult.length > 0) {
                    focusStats = statsResult[0];
                }
            } catch {
                // stats table may not exist yet; return null
            }

            return res.status(200).json({ success: true, courses, items, focusStats });
        } catch (error) {
            console.error('Load progress error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/progress — mark course/item complete
    if (req.method === 'POST') {
        const { courseId, itemId, unitId, version = '1.0.0', type } = req.body || {};

        if (!courseId && !itemId) {
            return res.status(400).json({ success: false, error: 'Missing courseId or itemId' });
        }

        try {
            if (type === 'course' || courseId) {
                await sql`
                    INSERT INTO course_progress (user_id, course_id, completed, completed_at, version)
                    VALUES (${user.id}, ${courseId}, true, NOW(), ${version})
                    ON CONFLICT (user_id, course_id) 
                    DO UPDATE SET completed = true, completed_at = NOW(), version = EXCLUDED.version
                `;
            }

            if (itemId) {
                await sql`
                    INSERT INTO item_progress (user_id, item_id, course_id, unit_id, completed, completed_at)
                    VALUES (${user.id}, ${itemId}, ${courseId || ''}, ${unitId || ''}, true, NOW())
                    ON CONFLICT (user_id, item_id) 
                    DO UPDATE SET completed = true, completed_at = NOW()
                `;
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Mark progress error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/progress — reset all progress
    if (req.method === 'DELETE') {
        try {
            await sql`DELETE FROM course_progress WHERE user_id = ${user.id}`;
            await sql`DELETE FROM item_progress WHERE user_id = ${user.id}`;
            await sql`DELETE FROM task_progress WHERE user_id = ${user.id}`;
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Reset progress error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
