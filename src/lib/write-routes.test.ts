import { afterEach, describe, expect, it } from 'vitest';
import { POST as createRecipe } from '@/app/api/recipes/route';
import { POST as requestUpload } from '@/app/api/s3/upload/route';

const environment = process.env as Record<string, string | undefined>;
const originalFamilyToken = process.env.FAMILY_ACCESS_TOKEN;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalFamilyToken === undefined) delete environment.FAMILY_ACCESS_TOKEN;
  else environment.FAMILY_ACCESS_TOKEN = originalFamilyToken;

  if (originalNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = originalNodeEnv;
});

function post(url: string, body: unknown, token?: string) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { 'x-family-token': token } : {}),
    },
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
        ingredients: [{ name: 'Water', quantity: '2 cups' }],
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
    environment.FAMILY_ACCESS_TOKEN = 'family-secret';
    environment.NODE_ENV = 'production';

    const response = await invoke();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Family access token is required.',
    });
  });
});
