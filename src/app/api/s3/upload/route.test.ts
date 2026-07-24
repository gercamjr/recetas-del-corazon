import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getServerSession = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));

vi.mock('@/lib/auth-options', () => ({
  authOptions: { providers: [] },
}));

const awsVariables = [
  'AWS_S3_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME',
] as const;
const originalValues = Object.fromEntries(awsVariables.map((name) => [name, process.env[name]]));

beforeEach(() => {
  for (const name of awsVariables) delete process.env[name];
  getServerSession.mockResolvedValue({
    user: { id: 'u1', username: 'tester', role: 'member', name: 'Tester' },
  });
  vi.resetModules();
});

afterEach(() => {
  for (const name of awsVariables) {
    const value = originalValues[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  getServerSession.mockReset();
});

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/s3/upload', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('S3 upload API', () => {
  it('returns 503 when S3 is not configured', async () => {
    const { POST } = await import('./route');

    const response = await POST(jsonRequest({
      filename: 'family-photo.jpg',
      contentType: 'image/jpeg',
      recipeId: '550e8400-e29b-41d4-a716-446655440000',
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Image upload service is not configured.',
    });
  });

  it('returns 400 for malformed JSON', async () => {
    const { POST } = await import('./route');
    const request = new Request('http://localhost/api/s3/upload', {
      method: 'POST',
      body: '{bad json',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it.each([
    ['non-image content types', { filename: 'payload.html', contentType: 'text/html', recipeId: 'recipe-1' }],
    ['unsafe recipe ids', { filename: 'photo.jpg', contentType: 'image/jpeg', recipeId: '../escape' }],
    ['unsafe filenames', { filename: '../photo.jpg', contentType: 'image/jpeg', recipeId: 'recipe-1' }],
    ['blank filenames', { filename: '   ', contentType: 'image/jpeg', recipeId: 'recipe-1' }],
  ])('rejects %s', async (_label, body) => {
    const { POST } = await import('./route');

    const response = await POST(jsonRequest(body));

    expect(response.status).toBe(400);
  });
});
