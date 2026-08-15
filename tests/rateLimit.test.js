import { describe, it, expect, vi } from 'vitest';

// The buckets map is module-level; reset it between tests by re-importing
// is not possible, so use unique keys per test and a fresh module via vi.resetModules.
const importFresh = async () => (await import('../shared/_lib/rateLimit.js?v=' + Date.now()));

const mockRes = () => {
    const res = { statusCode: null, body: null };
    res.status = vi.fn(function (code) { this.statusCode = code; return this; });
    res.json = vi.fn(function (data) { this.body = data; return this; });
    return res;
};

describe('rateLimit', () => {
    it('allows requests under the limit', async () => {
        const { rateLimit: rl } = await importFresh();
        const key = 'test-under-' + Date.now();
        expect(rl(key, 3, 60000)).toBe(true);
        expect(rl(key, 3, 60000)).toBe(true);
        expect(rl(key, 3, 60000)).toBe(true);
    });

    it('blocks requests over the limit', async () => {
        const { rateLimit: rl } = await importFresh();
        const key = 'test-over-' + Date.now();
        expect(rl(key, 2, 60000)).toBe(true);
        expect(rl(key, 2, 60000)).toBe(true);
        expect(rl(key, 2, 60000)).toBe(false);
    });

    it('resets after the window expires', async () => {
        const { rateLimit: rl } = await importFresh();
        const key = 'test-window-' + Date.now();
        expect(rl(key, 1, 50)).toBe(true);
        expect(rl(key, 1, 50)).toBe(false);
        await new Promise(r => setTimeout(r, 60));
        expect(rl(key, 1, 50)).toBe(true);
    });
});

describe('rateLimitAuth', () => {
    it('returns true when allowed (fix for hang bug)', async () => {
        const { rateLimitAuth: rla } = await importFresh();
        const res = mockRes();
        const req = { headers: { 'x-forwarded-for': '1.2.3.4' }, socket: {} };
        // First call with a fresh IP is always allowed
        const result = rla(req, res);
        expect(result).toBe(true);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns false and sends 429 when blocked', async () => {
        const { rateLimitAuth: rla } = await importFresh();
        const res = mockRes();
        const ip = '203.0.113.' + Math.floor(Math.random() * 200);
        const req = { headers: { 'x-forwarded-for': ip }, socket: {} };

        // Exhaust the limit (20) plus one more
        for (let i = 0; i < 20; i++) {
            expect(rla(req, res)).toBe(true);
        }
        const blocked = rla(req, res);
        expect(blocked).toBe(false);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.body?.error).toBe('Too many requests. Try again later.');
    });
});

describe('rateLimitStrict', () => {
    it('returns boolean, never undefined (regression for 504 hang)', async () => {
        const { rateLimitStrict: rls } = await importFresh();
        const ip = '198.51.100.' + Math.floor(Math.random() * 200);
        const req = { headers: { 'x-forwarded-for': ip }, socket: {} };

        for (let i = 0; i < 5; i++) {
            const res = mockRes();
            expect(rls(req, res)).toBe(true);
        }
        const res = mockRes();
        expect(rls(req, res)).toBe(false);
        expect(res.status).toHaveBeenCalledWith(429);
    });
});
