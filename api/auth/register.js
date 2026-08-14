import { sql } from '../_lib/db.js';
import bcrypt from 'bcryptjs';
import { generateVerificationCode } from '../../src/lib/emailService.js';
import { sendVerificationEmail } from '../_lib/email.js';
import { createSession } from '../_lib/auth.js';
import { rateLimitAuth } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    if (!rateLimitAuth(req, res, () => {})) return;

    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const result = await sql`
            INSERT INTO users (email, password_hash, name, is_admin, subscription_tier, email_verification_code, email_verification_expires)
            VALUES (${email.toLowerCase()}, ${passwordHash}, ${name}, false, 'free', ${verificationCode}, ${expiresAt})
            RETURNING id, email, name, is_admin, subscription_tier, joined_date, created_at
        `;

        // Send verification email (non-fatal if it fails)
        await sendVerificationEmail(email.toLowerCase(), verificationCode).catch(() => {});

        const token = await createSession(result[0].id);
        const { password_hash: _ph, email_verification_code: _vc, email_verification_expires: _ve, ...safeUser } = result[0];

        return res.status(201).json({ success: true, token, user: safeUser });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message && error.message.includes('duplicate key')) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }
        return res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
}
