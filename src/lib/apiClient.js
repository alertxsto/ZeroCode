// Thin fetch wrapper for the serverless API.
// Adds the Bearer token from localStorage to every request.
// All database access goes through these endpoints — the browser
// never talks to Neon directly anymore.

const TOKEN_KEY = 'zerocode_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
};

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(data?.error || `Request failed (${response.status})`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}
