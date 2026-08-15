import { sql } from '../shared/_lib/db.js';
import { getUserFromRequest } from '../shared/_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get top 100 users by points (no email exposure)
        const leaderboard = await sql`
            SELECT 
                id,
                name,
                points,
                courses_completed,
                ROW_NUMBER() OVER (ORDER BY points DESC, courses_completed DESC) as rank
            FROM users
            WHERE is_email_verified = true
            ORDER BY points DESC, courses_completed DESC
            LIMIT 100
        `;

        // Get user's rank from session token if present
        const user = await getUserFromRequest(req);
        let userRank = null;

        if (user) {
            const userRankResult = await sql`
                SELECT 
                    id,
                    name,
                    points,
                    courses_completed,
                    ROW_NUMBER() OVER (ORDER BY points DESC, courses_completed DESC) as rank
                FROM users
                WHERE id = ${user.id}
            `;

            if (userRankResult.length > 0) {
                userRank = userRankResult[0];
            }
        }

        return res.status(200).json({
            success: true,
            leaderboard: leaderboard,
            userRank: userRank
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
