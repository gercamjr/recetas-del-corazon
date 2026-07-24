import { afterEach, describe, expect, it, vi } from 'vitest';

const getServerSession = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));

vi.mock('@/lib/auth-options', () => ({
  authOptions: { providers: [] },
}));

import { authorizeWrite } from './write-auth';

afterEach(() => {
  getServerSession.mockReset();
});

describe('authorizeWrite (session)', () => {
  it('rejects when there is no session', async () => {
    getServerSession.mockResolvedValue(null);

    const response = await authorizeWrite();
    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toEqual({
      success: false,
      error: 'Sign in required to change recipes.',
    });
  });

  it('allows when session user is present', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'u1', username: 'abuela', role: 'member', name: 'Abuela' },
    });

    await expect(authorizeWrite()).resolves.toBeNull();
  });
});
