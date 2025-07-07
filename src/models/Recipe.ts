import mongoose, { Schema, Document, Model } from 'mongoose';
import { Recipe as RecipeType } from '@/types/recipe'; // Using our existing Recipe type

// Define the interface for an Ingredient subdocument
interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

// Define the Mongoose schema for an Ingredient
const IngredientSchema = new Schema<Ingredient>({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String }
}, { _id: false }); // _id is not needed for subdocuments if not queried directly

// Define the Mongoose schema for a Recipe document
// This will extend our existing RecipeType for type safety with Mongoose Document properties
export interface RecipeDocument extends RecipeType, Document {
  _id: string; // Mongoose uses _id as string by default in Document interface
}

const RecipeSchema = new Schema<RecipeDocument>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  ingredients: [IngredientSchema], // Array of Ingredient subdocuments
  instructions: [{ type: String, required: true }], // Array of strings
  imageUrls: [{ type: String }], // Array of image URLs from S3
  tags: [{ type: String, trim: true }],
  prepTime: { type: String },
  cookTime: { type: String },
  servings: { type: Number },
  authorId: { type: String, required: true }, // Assuming authorId will be a string (e.g., user ID)
  language: { type: String, enum: ['en', 'es'], required: true },
  notes: { type: String, trim: true },
  // Timestamps are automatically managed by Mongoose if {timestamps: true} is set
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Create and export the Mongoose model
// The third argument is the collection name in MongoDB. Mongoose usually pluralizes the model name.
// Explicitly setting it to 'recipes'
const RecipeModel: Model<RecipeDocument> = mongoose.models.Recipe || mongoose.model<RecipeDocument>('Recipe', RecipeSchema, 'recipes');

export default RecipeModel;
