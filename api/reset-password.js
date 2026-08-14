import { sql } from './_lib/db.js';
import bcrypt from 'bcryptjs';
import { rateLimitStrict } from './_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!rateLimitStrict(req, res, () => {})) return;

    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    try {
        // Get user and check reset code
        const result = await sql`
            SELECT id, password_reset_code, password_reset_expires
            FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const user = result[0];

        // Check if code matches
        if (user.password_reset_code !== code) {
            return res.status(400).json({ success: false, error: 'Invalid reset code' });
        }

        // Check if code expired
        if (new Date() > new Date(user.password_reset_expires)) {
            return res.status(400).json({ success: false, error: 'Reset code expired' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset code
        await sql`
            UPDATE users
            SET password_hash = ${passwordHash}, password_reset_code = NULL, password_reset_expires = NULL
            WHERE id = ${user.id}
        `;

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
