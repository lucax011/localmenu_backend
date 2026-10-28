import { Prisma } from '@prisma/client';
import { slugify } from './slug';
import { toSafeUser } from './safeUser';
import { plainNumbers } from '../interceptors/plainNumbers.interceptor';

describe('slugify', () => {
  it('tira acentos, espaços e símbolos', () => {
    expect(slugify('Cantina da Nonna')).toBe('cantina-da-nonna');
    expect(slugify('  Açaí & Cia. ')).toBe('acai-cia');
  });
});

describe('toSafeUser', () => {
  it('remove senha e hash do refresh token', () => {
    const safe = toSafeUser({
      id: '1',
      email: 'a@b.c',
      password: 'hash',
      refreshTokenHash: 'hash2',
    } as never);
    expect(safe).toEqual({ id: '1', email: 'a@b.c' });
  });
});

describe('plainNumbers', () => {
  it('converte Decimal em número em qualquer nível, sem mexer em datas', () => {
    const date = new Date('2026-10-27T12:00:00Z');
    const out = plainNumbers({
      price: new Prisma.Decimal('24.90'),
      when: date,
      items: [{ total: new Prisma.Decimal('1.5') }],
    });
    expect(out).toEqual({ price: 24.9, when: date, items: [{ total: 1.5 }] });
  });
});
