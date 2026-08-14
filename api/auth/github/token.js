export default async function handler(request, response) {
    // CORS Configuration
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    const { code } = request.query;

    if (!code) {
        return response.status(400).json({ error: 'Missing code parameter' });
    }

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.VITE_GITHUB_CLIENT_ID, // Can read from same env var as frontend
                client_secret: process.env.GITHUB_CLIENT_SECRET, // MUST be set in Vercel Settings
                code,
            }),
        });

        const data = await tokenResponse.json();
        return response.status(200).json(data);
    } catch {
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
