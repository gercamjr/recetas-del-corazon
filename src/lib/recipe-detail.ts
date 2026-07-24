import type { Recipe } from '@/types/recipe';
import dbConnect, { MissingEnvironmentError } from '@/lib/mongodb';
import { isValidRecipeId } from '@/lib/recipe-validation';
import RecipeModel from '@/models/Recipe';

type RecipeApiResponse = {
  success?: boolean;
  data?: Recipe;
};

export type RecipeFetchResult =
  | { status: 'success'; recipe: Recipe }
  | { status: 'not-found' }
  | { status: 'error' };

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RecipeApiOriginOptions = {
  vercelUrl?: string;
  nodeEnv?: string;
  host?: string | null;
  forwardedProto?: string | null;
  appUrl?: string;
};

/** Prefer VERCEL_URL / host for HTTP self-fetch; primary path uses loadRecipeById (DB). */
export function getRecipeApiOrigin({
  vercelUrl,
  nodeEnv,
  host,
  forwardedProto,
  appUrl,
}: RecipeApiOriginOptions): string | null {
  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  }

  // Only trust Host in local development (prod uses VERCEL_URL or loadRecipeById).
  if (nodeEnv === 'development' && host) {
    const protocol = forwardedProto === 'https' ? 'https' : 'http';
    return `${protocol}://${host}`;
  }

  return null;
}

/** Server-side: load recipe from Mongo (preferred for RSC detail page). */
export async function loadRecipeById(id: string): Promise<RecipeFetchResult> {
  if (!isValidRecipeId(id)) {
    return { status: 'not-found' };
  }

  try {
    await dbConnect();
    const recipe = await RecipeModel.findById(id).lean();
    if (!recipe) {
      return { status: 'not-found' };
    }

    const plain = {
      ...recipe,
      _id: String((recipe as { _id: unknown })._id),
    } as Recipe;

    return { status: 'success', recipe: plain };
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      console.error('Recipe detail: Mongo not configured');
    } else {
      console.error('Recipe detail DB load failed:', error);
    }
    return { status: 'error' };
  }
}

/** HTTP fetch path (tests / optional). */
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

    const body = (await response.json()) as RecipeApiResponse;
    if (!body.success || !body.data) {
      return { status: 'error' };
    }

    return { status: 'success', recipe: body.data };
  } catch (error) {
    console.error('Recipe detail fetch failed:', error);
    return { status: 'error' };
  }
}
