type IngredientInput = {
  name: string;
  quantity: string;
  unit?: string;
};

export type ValidatedRecipeInput = {
  title: string;
  description: string;
  ingredients: IngredientInput[];
  instructions: string[];
  imageUrls: string[];
  tags?: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  language: 'en' | 'es';
  notes?: string;
};

type ValidationResult =
  | { success: true; data: ValidatedRecipeInput }
  | { success: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function optionalString(value: unknown): string | undefined | null {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value.trim() : null;
}

function stringArray(value: unknown, field: string): { data?: string[]; error?: string } {
  if (!Array.isArray(value)) return { error: `${field} must be an array of strings` };

  const values = value.map(nonEmptyString);
  if (values.some((item) => item === null)) {
    return { error: `${field} must contain only non-empty strings` };
  }

  return { data: values as string[] };
}

export function validateRecipeInput(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { success: false, error: 'Request body must be a JSON object' };
  }

  const title = nonEmptyString(value.title);
  if (!title) return { success: false, error: 'title must be a non-empty string' };

  const description = nonEmptyString(value.description);
  if (!description) return { success: false, error: 'description must be a non-empty string' };

  if (!Array.isArray(value.ingredients) || value.ingredients.length === 0) {
    return { success: false, error: 'ingredients must be a non-empty array' };
  }

  const ingredients: IngredientInput[] = [];
  for (const ingredient of value.ingredients) {
    if (!isRecord(ingredient)) {
      return { success: false, error: 'each ingredient must be an object' };
    }

    const name = nonEmptyString(ingredient.name);
    const quantity = nonEmptyString(ingredient.quantity);
    const unit = optionalString(ingredient.unit);
    if (!name || !quantity || unit === null) {
      return {
        success: false,
        error: 'each ingredient requires non-empty name and quantity strings; unit must be a string when provided',
      };
    }

    ingredients.push({ name, quantity, ...(unit === undefined ? {} : { unit }) });
  }

  const instructionsResult = stringArray(value.instructions, 'instructions');
  if (instructionsResult.error || instructionsResult.data?.length === 0) {
    return {
      success: false,
      error: instructionsResult.error ?? 'instructions must be a non-empty array',
    };
  }

  const imageUrlsValue = value.imageUrls ?? [];
  const imageUrlsResult = stringArray(imageUrlsValue, 'imageUrls');
  if (imageUrlsResult.error) return { success: false, error: imageUrlsResult.error };
  const imageUrls = imageUrlsResult.data ?? [];
  if (imageUrls.some((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol !== 'https:' && parsed.protocol !== 'http:';
    } catch {
      return true;
    }
  })) {
    return { success: false, error: 'imageUrls must contain valid HTTP(S) URLs' };
  }

  let tags: string[] | undefined;
  if (value.tags !== undefined) {
    const tagsResult = stringArray(value.tags, 'tags');
    if (tagsResult.error) return { success: false, error: tagsResult.error };
    tags = tagsResult.data;
  }

  const prepTime = optionalString(value.prepTime);
  const cookTime = optionalString(value.cookTime);
  const notes = optionalString(value.notes);
  if (prepTime === null || cookTime === null || notes === null) {
    return { success: false, error: 'prepTime, cookTime, and notes must be strings when provided' };
  }

  let servings: number | undefined;
  if (value.servings !== undefined && value.servings !== '') {
    servings = typeof value.servings === 'number'
      ? value.servings
      : typeof value.servings === 'string'
        ? Number(value.servings)
        : Number.NaN;
    if (!Number.isFinite(servings) || servings <= 0) {
      return { success: false, error: 'servings must be a positive number when provided' };
    }
  }

  if (value.language !== 'en' && value.language !== 'es') {
    return { success: false, error: 'language must be either en or es' };
  }

  return {
    success: true,
    data: {
      title,
      description,
      ingredients,
      instructions: instructionsResult.data ?? [],
      imageUrls,
      ...(tags === undefined ? {} : { tags }),
      ...(prepTime === undefined ? {} : { prepTime }),
      ...(cookTime === undefined ? {} : { cookTime }),
      ...(servings === undefined ? {} : { servings }),
      language: value.language,
      ...(notes === undefined ? {} : { notes }),
    },
  };
}
