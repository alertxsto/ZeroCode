import { describe, it, expect } from 'vitest';
import { PRICING, formatPrice, buildPurchaseMessage } from '../src/lib/pricing.js';

describe('pricing consistency', () => {
    it('has all four tiers', () => {
        expect(Object.keys(PRICING).sort()).toEqual(['developer', 'master', 'professional', 'starter']);
    });

    it('prices match the published amounts', () => {
        expect(PRICING.starter.price).toBe(50000);
        expect(PRICING.developer.price).toBe(75000);
        expect(PRICING.professional.price).toBe(80000);
        expect(PRICING.master.price).toBe(164000);
    });

    it('tier names are consistent', () => {
        expect(PRICING.starter.tier).toBe('beginner');
        expect(PRICING.developer.tier).toBe('intermediate');
        expect(PRICING.professional.tier).toBe('advanced');
        expect(PRICING.master.tier).toBe('fullstack');
    });

    it('formatPrice renders Indonesian Rupiah', () => {
        expect(formatPrice(164000)).toBe('Rp 164.000');
        expect(formatPrice(50000)).toBe('Rp 50.000');
    });

    it('buildPurchaseMessage includes plan and price', () => {
        const msg = buildPurchaseMessage('master', { email: 'a@b.c', name: 'User' });
        expect(msg).toContain('Master Key Bundle');
        expect(msg).toContain('Rp 164.000');
        expect(msg).toContain('a@b.c');
    });
});
