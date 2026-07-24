import { afterEach, describe, expect, it, vi } from 'vitest';

const getServerSession = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));

vi.mock('@/lib/auth-options', () => ({
  authOptions: { providers: [] },
}));

import { POST as createRecipe } from '@/app/api/recipes/route';
import { POST as requestUpload } from '@/app/api/s3/upload/route';

afterEach(() => {
  getServerSession.mockReset();
});

function post(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('write route authorization', () => {
  it.each([
    [
      'recipe creation',
      () => createRecipe(post('http://localhost/api/recipes', {
        title: 'Soup',
        description: 'Family soup',
        ingredients: [{ name: 'Water', quantity: '2', unit: 'cups' }],
        instructions: ['Simmer'],
        language: 'en',
      })),
    ],
    [
      'S3 upload signing',
      () => requestUpload(post('http://localhost/api/s3/upload', {
        filename: 'family-photo.jpg',
        contentType: 'image/jpeg',
        recipeId: 'recipe-1',
      })),
    ],
  ])('rejects unauthenticated %s before processing the request', async (_label, invoke) => {
    getServerSession.mockResolvedValue(null);

    const response = await invoke();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Sign in required to change recipes.',
    });
  });
});
