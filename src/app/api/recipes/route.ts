import { NextResponse } from 'next/server';
import dbConnect, { MissingEnvironmentError } from '@/lib/mongodb';
import { validateRecipeInput } from '@/lib/recipe-validation';
import { requireSessionUser } from '@/lib/session-auth';
import RecipeModel from '@/models/Recipe';

function databaseErrorResponse(error: unknown, operation: string) {
  if (error instanceof MissingEnvironmentError) {
    return NextResponse.json(
      { success: false, error: 'Recipe service is not configured.' },
      { status: 503 },
    );
  }

  console.error(`API error ${operation} recipes:`, error);
  return NextResponse.json(
    { success: false, error: `Could not ${operation} recipes.` },
    { status: 500 },
  );
}

export async function GET() {
  try {
    await dbConnect();
    const recipes = await RecipeModel.find({}).sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: recipes }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse(error, 'fetch');
  }
}

export async function POST(request: Request) {
  const { user, error: authError } = await requireSessionUser();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must contain valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateRecipeInput(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    const newRecipe = await RecipeModel.create({
      ...validation.data,
      authorId: user.id,
    });

    return NextResponse.json({ success: true, data: newRecipe }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, 'create');
  }
}
