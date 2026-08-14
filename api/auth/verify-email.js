import { sql } from '../_lib/db.js';
import { sendWelcomeEmail } from '../_lib/email.js';
import { createSession } from '../_lib/auth.js';
import { rateLimitStrict } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!rateLimitStrict(req, res, () => {})) return;

    const { email, code } = req.body || {};

    if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Missing email or code' });
    }

    try {
        const result = await sql`
            SELECT id, email_verification_code, email_verification_expires, is_email_verified, name
            FROM users WHERE email = ${email.toLowerCase()}
        `;

        if (result.length === 0) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const dbUser = result[0];

        if (dbUser.is_email_verified) {
            return res.status(200).json({ success: true, message: 'Email already verified' });
        }

        if (dbUser.email_verification_code !== code) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        if (new Date() > new Date(dbUser.email_verification_expires)) {
            return res.status(400).json({ success: false, error: 'Verification code expired' });
        }

        await sql`
            UPDATE users
            SET is_email_verified = true, email_verification_code = NULL, email_verification_expires = NULL
            WHERE id = ${dbUser.id}
        `;

        // Send welcome email (non-fatal if it fails)
        await sendWelcomeEmail(email.toLowerCase(), dbUser.name).catch(() => {});

        // Create session so the user is logged in right after verification
        const token = await createSession(dbUser.id);

        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Verification failed' });
    }
}
