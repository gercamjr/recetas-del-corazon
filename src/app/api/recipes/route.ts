import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RecipeModel from '@/models/Recipe';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch all recipes from the database, sorted by most recently updated
    const recipes = await RecipeModel.find({}).sort({ updatedAt: -1 });

    // Return the recipes as a JSON response
    return NextResponse.json({
      success: true,
      data: recipes,
    }, { status: 200 });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('API Error fetching recipes:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json({
      success: false,
      error: 'Server Error: Could not fetch recipes.',
      details: errorMessage,
    }, { status: 500 });
  }
}
