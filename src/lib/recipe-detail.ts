import type { Recipe } from '@/types/recipe';

type RecipeApiResponse = {
  success?: boolean;
  data?: Recipe;
};

type RecipeFetchResult =
  | { status: 'success'; recipe: Recipe }
  | { status: 'not-found' }
  | { status: 'error' };

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RecipeApiOriginOptions = {
  vercelUrl?: string;
  nodeEnv?: string;
  host?: string | null;
  forwardedProto?: string | null;
};

export function getRecipeApiOrigin({
  vercelUrl,
  nodeEnv,
  host,
  forwardedProto,
}: RecipeApiOriginOptions): string | null {
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  }

  if (nodeEnv !== 'development' || !host) {
    return null;
  }

  const protocol = forwardedProto === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

export async function fetchRecipeById(
  id: string,
  origin: string,
  fetchImpl: Fetcher = fetch,
): Promise<RecipeFetchResult> {
  try {
    const response = await fetchImpl(
      `${origin.replace(/\/$/, '')}/api/recipes/${encodeURIComponent(id)}`,
      { cache: 'no-store' },
    );

    if (response.status === 400 || response.status === 404) {
      return { status: 'not-found' };
    }

    if (!response.ok) {
      return { status: 'error' };
    }

    const body = await response.json() as RecipeApiResponse;
    if (!body.success || !body.data) {
      return { status: 'error' };
    }

    return { status: 'success', recipe: body.data };
  } catch (error) {
    console.error('Recipe detail fetch failed:', error);
    return { status: 'error' };
  }
}
