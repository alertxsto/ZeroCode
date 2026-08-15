// Simple in-memory sliding-window rate limiter.
// NOTE: per-Vercel-instance only; good for basic brute-force damping,
// not a hard guarantee across many lambda instances.

const buckets = new Map();

/**
 * Check if a request is allowed under the given limit.
 * @param {string} key      - e.g. `login:1.2.3.4`
 * @param {number} max      - max requests allowed within the window
 * @param {number} windowMs - window length in milliseconds
 * @returns {boolean} true if allowed, false if rate-limited
 */
export function rateLimit(key, max, windowMs) {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    bucket.count += 1;
    if (bucket.count > max) {
        return false;
    }
    return true;
}

// Periodic cleanup so the map does not grow unbounded
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of buckets) {
            if (bucket.resetAt <= now) buckets.delete(key);
        }
    }, 10 * 60 * 1000).unref?.();
}

// Standard helper for auth-ish endpoints.
// Returns true if allowed, false if rate-limited (response already sent).
export function rateLimitAuth(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!rateLimit(`auth:${ip}`, 20, 10 * 60 * 1000)) {
        res.status(429).json({ success: false, error: 'Too many requests. Try again later.' });
        return false;
    }
    return true;
}

export function rateLimitStrict(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!rateLimit(`strict:${ip}`, 5, 15 * 60 * 1000)) {
        res.status(429).json({ success: false, error: 'Too many attempts. Try again later.' });
        return false;
    }
    return true;
}
