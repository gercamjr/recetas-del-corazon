import { describe, expect, it, vi } from 'vitest';
import { fetchRecipeById, getRecipeApiOrigin } from './recipe-detail';

const recipe = {
  _id: '6a63bf0d30170de7d97a30d9',
  title: 'Family soup',
  description: 'A favorite',
  ingredients: [{ name: 'Water', quantity: '2', unit: 'cups' }],
  instructions: ['Simmer'],
  imageUrls: [],
  authorId: 'family',
  createdAt: '2026-07-24T00:00:00.000Z',
  updatedAt: '2026-07-24T00:00:00.000Z',
  language: 'en',
};

describe('fetchRecipeById', () => {
  it('returns a live recipe from the recipe detail API without caching', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: recipe }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    const result = await fetchRecipeById(recipe._id, 'https://recipes.example.com', fetchImpl);

    expect(result).toEqual({ status: 'success', recipe });
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://recipes.example.com/api/recipes/${recipe._id}`,
      { cache: 'no-store' },
    );
  });

  it.each([400, 404])('maps API status %s to not found', async (status) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status }));

    await expect(fetchRecipeById(recipe._id, 'https://recipes.example.com', fetchImpl))
      .resolves.toEqual({ status: 'not-found' });
  });

  it('returns an error result when the API fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: 'Recipe service is not configured.',
    }), { status: 503 }));

    await expect(fetchRecipeById(recipe._id, 'https://recipes.example.com', fetchImpl))
      .resolves.toEqual({ status: 'error' });
  });

  it('returns an error result when the request cannot be completed', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network unavailable'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(fetchRecipeById(recipe._id, 'https://recipes.example.com', fetchImpl))
      .resolves.toEqual({ status: 'error' });
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});

describe('getRecipeApiOrigin', () => {
  it('uses the trusted Vercel deployment URL in production', () => {
    expect(getRecipeApiOrigin({
      vercelUrl: 'preview-recipes.vercel.app',
      nodeEnv: 'production',
      host: 'attacker.example.com',
      forwardedProto: 'http',
    })).toBe('https://preview-recipes.vercel.app');
  });

  it('uses the request host for local development', () => {
    expect(getRecipeApiOrigin({
      nodeEnv: 'development',
      host: '192.168.117.89:3000',
      forwardedProto: 'http',
    })).toBe('http://192.168.117.89:3000');
  });

  it('does not trust an arbitrary request host in production', () => {
    expect(getRecipeApiOrigin({
      nodeEnv: 'production',
      host: 'attacker.example.com',
      forwardedProto: 'https',
    })).toBeNull();
  });
});
