import { requireUser } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const user = await requireUser(req, res);
    if (!user) return;

    return res.status(200).json({ success: true, user });
}
