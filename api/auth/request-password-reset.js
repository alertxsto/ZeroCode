import { sql } from '../_lib/db.js';
import { generateVerificationCode } from '../../src/lib/emailService.js';
import { sendPasswordResetEmail } from '../_lib/email.js';
import { rateLimitAuth } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!rateLimitAuth(req, res, () => {})) return;

    const { email } = req.body || {};

    if (!email) {
        return res.status(400).json({ success: false, error: 'Missing email' });
    }

    try {
        const result = await sql`
            SELECT id, name FROM users WHERE email = ${email.toLowerCase()}
        `;

        // Always return success to avoid user enumeration
        if (result.length === 0) {
            return res.status(200).json({ success: true, message: 'If email exists, reset code sent' });
        }

        const resetCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await sql`
            UPDATE users
            SET password_reset_code = ${resetCode}, password_reset_expires = ${expiresAt}
            WHERE email = ${email.toLowerCase()}
        `;

        await sendPasswordResetEmail(email.toLowerCase(), resetCode).catch(() => {});

        return res.status(200).json({ success: true, message: 'Reset link sent to email' });
    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to request reset' });
    }
}
