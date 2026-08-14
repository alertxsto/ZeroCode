import { deleteSession } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await deleteSession(req);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ success: false, error: 'Logout failed' });
    }
}
