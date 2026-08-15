import { describe, it, expect } from 'vitest';
// auth.js imports db.js which calls neon() at module load; a placeholder
// connection string is enough since hashToken never touches the DB.
process.env.NEON_DATABASE_URL = process.env.NEON_DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder';
const { hashToken } = await import('../shared/_lib/auth.js');

describe('hashToken', () => {
    it('produces a 64-char hex sha256 hash', () => {
        const hash = hashToken('some-raw-token');
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('is deterministic for the same input', () => {
        expect(hashToken('abc')).toBe(hashToken('abc'));
    });

    it('never returns the raw token (DB leak safety)', () => {
        const raw = 'super-secret-session-token';
        expect(hashToken(raw)).not.toContain(raw);
    });

    it('produces different hashes for different tokens', () => {
        expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
    });
});
