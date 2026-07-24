import { NextResponse } from 'next/server';
import dbConnect, { MissingEnvironmentError } from '@/lib/mongodb';
import { isValidRecipeId, validateRecipePatch } from '@/lib/recipe-validation';
import RecipeModel from '@/models/Recipe';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function databaseErrorResponse(error: unknown, operation: string) {
  if (error instanceof MissingEnvironmentError) {
    return errorResponse('Recipe service is not configured.', 503);
  }

  console.error(`API error ${operation} recipe:`, error);
  return errorResponse(`Could not ${operation} recipe.`, 500);
}

async function recipeId(context: RouteContext) {
  const { id } = await context.params;
  return isValidRecipeId(id) ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const id = await recipeId(context);
  if (!id) return errorResponse('Invalid recipe id.', 400);

  try {
    await dbConnect();
    const recipe = await RecipeModel.findById(id);
    if (!recipe) return errorResponse('Recipe not found.', 404);

    return NextResponse.json({ success: true, data: recipe }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse(error, 'fetch');
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const id = await recipeId(context);
  if (!id) return errorResponse('Invalid recipe id.', 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must contain valid JSON.', 400);
  }

  const validation = validateRecipePatch(body);
  if (!validation.success) return errorResponse(validation.error, 400);

  try {
    await dbConnect();
    const recipe = await RecipeModel.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    });
    if (!recipe) return errorResponse('Recipe not found.', 404);

    return NextResponse.json({ success: true, data: recipe }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse(error, 'update');
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const id = await recipeId(context);
  if (!id) return errorResponse('Invalid recipe id.', 400);

  try {
    await dbConnect();
    const recipe = await RecipeModel.findByIdAndDelete(id);
    if (!recipe) return errorResponse('Recipe not found.', 404);

    return NextResponse.json({ success: true, data: recipe }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse(error, 'delete');
  }
}
