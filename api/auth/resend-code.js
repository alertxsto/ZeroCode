import { sql } from '../_lib/db.js';
import { generateVerificationCode } from '../../src/lib/emailService.js';
import { sendVerificationEmail } from '../_lib/email.js';
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

        if (result.length === 0) {
            return res.status(200).json({ success: true, message: 'If email exists, a code was sent' });
        }

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await sql`
            UPDATE users
            SET email_verification_code = ${verificationCode}, email_verification_expires = ${expiresAt}
            WHERE email = ${email.toLowerCase()}
        `;

        await sendVerificationEmail(email.toLowerCase(), verificationCode).catch(() => {});

        return res.status(200).json({ success: true, message: 'Verification code sent' });
    } catch (error) {
        console.error('Resend code error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to resend code' });
    }
}
