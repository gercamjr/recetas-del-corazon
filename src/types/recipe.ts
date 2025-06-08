/**
 * @interface Recipe
 * @description Defines the structure for a recipe object.
 * @author GitHub Copilot
 */
export interface Recipe {
  /**
   * @property {string} _id - The unique identifier for the recipe (typically from MongoDB).
   */
  _id: string;

  /**
   * @property {string} title - The title of the recipe.
   */
  title: string;

  /**
   * @property {string} description - A short description of the recipe.
   */
  description: string;

  /**
   * @property {Array<{ name: string; quantity: string; unit?: string }>} ingredients - A list of ingredients.
   * @example
   * ingredients: [
   *   { name: "Flour", quantity: "2", unit: "cups" },
   *   { name: "Sugar", quantity: "1", unit: "cup" },
   *   { name: "Eggs", quantity: "3" }
   * ]
   */
  ingredients: Array<{ name: string; quantity: string; unit?: string }>;

  /**
   * @property {string[]} instructions - Step-by-step instructions for preparing the recipe.
   */
  instructions: string[];

  /**
   * @property {string[]} imageUrls - The URLs of the recipe's images (will point to AWS S3).
   */
  imageUrls: string[];

  /**
   * @property {string[]} [tags] - Optional tags for categorizing or searching the recipe.
   * @example tags: ["dessert", "baking", "chocolate"]
   */
  tags?: string[];

  /**
   * @property {string} [prepTime] - Optional preparation time (e.g., "30 mins").
   */
  prepTime?: string;

  /**
   * @property {string} [cookTime] - Optional cooking time (e.g., "1 hour").
   */
  cookTime?: string;

  /**
   * @property {number} [servings] - Optional number of servings the recipe yields.
   */
  servings?: number;

  /**
   * @property {string} authorId - Identifier for the family member who added the recipe.
   */
  authorId: string; // We'll link this to a user model later

  /**
   * @property {string} [notes] - Optional additional notes or tips for the recipe.
   */
  notes?: string;

  /**
   * @property {Date} createdAt - The date and time when the recipe was created.
   */
  createdAt: Date;

  /**
   * @property {Date} updatedAt - The date and time when the recipe was last updated.
   */
  updatedAt: Date;

  /**
   * @property {string} language - The language of the recipe content (e.g., 'en', 'es').
   */
  language: 'en' | 'es';
}

/**
 * @interface RecipeFormData
 * @description Defines the structure for the recipe form data, omitting MongoDB generated fields.
 * @author GitHub Copilot
 */
export type RecipeFormData = Omit<Recipe, '_id' | 'createdAt' | 'updatedAt' | 'authorId'> & {
  /**
   * @property {File[]} [imageFiles] - The image files to be uploaded for the recipe.
   */
  imageFiles?: File[];
};
