import { describe, expect, it } from 'vitest';
import { formatJazzCashAmountPkr, normalizePkMobile } from './jazzcash-client';

describe('jazzcash-client', () => {
  it('formats PKR to smallest currency units', () => {
    expect(formatJazzCashAmountPkr(500)).toBe('50000');
    expect(formatJazzCashAmountPkr(99.99)).toBe('9999');
  });

  it('normalizes Pakistani mobile numbers', () => {
    expect(normalizePkMobile('03001234567')).toBe('03001234567');
    expect(normalizePkMobile('923001234567')).toBe('03001234567');
    expect(normalizePkMobile('3001234567')).toBe('03001234567');
  });
});
