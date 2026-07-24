import { afterEach, describe, expect, it, vi } from 'vitest';

const originalMongoUri = process.env.MONGODB_URI;
const originalFamilyToken = process.env.FAMILY_ACCESS_TOKEN;

afterEach(() => {
  if (originalMongoUri === undefined) {
    delete process.env.MONGODB_URI;
  } else {
    process.env.MONGODB_URI = originalMongoUri;
  }
  if (originalFamilyToken === undefined) {
    delete process.env.FAMILY_ACCESS_TOKEN;
  } else {
    process.env.FAMILY_ACCESS_TOKEN = originalFamilyToken;
  }
  vi.resetModules();
});

describe('MongoDB configuration handling', () => {
  it('checks MONGODB_URI when connecting instead of crashing at module import', async () => {
    delete process.env.MONGODB_URI;

    const mongodb = await import('./mongodb');

    await expect(mongodb.default()).rejects.toBeInstanceOf(mongodb.MissingEnvironmentError);
  });

  it('returns 503 JSON from the recipes API when MongoDB is not configured', async () => {
    delete process.env.MONGODB_URI;
    const { GET } = await import('../app/api/recipes/route');

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Recipe service is not configured.',
    });
  });

  it('validates recipe JSON before attempting a database connection', async () => {
    delete process.env.MONGODB_URI;
    process.env.FAMILY_ACCESS_TOKEN = 'test-family-token';
    const { POST } = await import('../app/api/recipes/route');
    const request = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-family-token': 'test-family-token',
      },
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('title');
  });

  it('returns 503 for a valid recipe when MongoDB is not configured', async () => {
    delete process.env.MONGODB_URI;
    process.env.FAMILY_ACCESS_TOKEN = 'test-family-token';
    const { POST } = await import('../app/api/recipes/route');
    const request = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-family-token': 'test-family-token',
      },
      body: JSON.stringify({
        title: 'Soup',
        description: 'Family soup',
        ingredients: [{ name: 'Water', quantity: '2 cups' }],
        instructions: ['Simmer'],
        language: 'en',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Recipe service is not configured.',
    });
  });
});
