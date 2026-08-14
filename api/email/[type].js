// Consolidated email endpoints via dynamic route:
//   /api/email/verification, /api/email/password-reset, /api/email/welcome
// Consolidates 3 serverless functions into 1 (Vercel Hobby 12-fn limit).

import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../_lib/email.js';
import { rateLimitAuth } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    if (!rateLimitAuth(req, res, () => {})) return;

    const type = req.query.type;
    const { email, verificationCode, resetCode, name } = req.body || {};

    if (!email) {
        return res.status(400).json({ success: false, error: 'Missing email' });
    }

    try {
        switch (type) {
            case 'verification':
                if (!verificationCode) {
                    return res.status(400).json({ success: false, error: 'Missing verificationCode' });
                }
                await sendVerificationEmail(email, verificationCode);
                return res.status(200).json({ success: true, message: 'Verification email sent' });

            case 'password-reset':
                if (!resetCode) {
                    return res.status(400).json({ success: false, error: 'Missing resetCode' });
                }
                await sendPasswordResetEmail(email, resetCode);
                return res.status(200).json({ success: true, message: 'Password reset email sent' });

            case 'welcome':
                await sendWelcomeEmail(email, name);
                return res.status(200).json({ success: true, message: 'Welcome email sent' });

            default:
                return res.status(404).json({ success: false, error: 'Unknown email type' });
        }
    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
