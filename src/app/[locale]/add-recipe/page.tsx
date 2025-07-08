'use client';

import { NextPage } from "next";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { RecipeFormData } from "@/types/recipe";
import { v4 as uuidv4 } from 'uuid';

// This page is a client component.
// Locale is accessed via context from next-intl, provided by NextIntlClientProvider in the layout.

// Removed generateStaticParams as it's not for 'use client' components with next-intl.
// export function generateStaticParams() {
//   return routing.locales.map((locale) => ({ locale }));
// }

// Removed params from props as locale will be obtained from useLocale hook
interface AddRecipePageProps {
  // params: { // No longer receiving params this way
  //   locale: string;
  // };
}

const AddRecipePage: NextPage<AddRecipePageProps> = (/*{ params }*/) => { // Removed params
  const locale = useLocale(); // Get current locale using the hook
  const t = useTranslations("AddRecipePage");
  const tNav = useTranslations("Navigation");
  const tForms = useTranslations("Forms");

  const initialFormData: RecipeFormData = {
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [''],
    imageUrls: [], // This will be populated by S3 URLs after upload
    imageFiles: [],
    tags: [],
    prepTime: '',
    cookTime: '',
    servings: undefined,
    language: locale as 'en' | 'es', // Use locale from useLocale hook
    notes: ''
  };

  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index: number, field: keyof RecipeFormData['ingredients'][number], value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredientField = () => {
    setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }] }));
  };

  const removeIngredientField = (index: number) => {
    if (formData.ingredients.length > 1) { // Keep at least one ingredient field
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstructionField = () => {
    setFormData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
  };

  const removeInstructionField = (index: number) => {
    if (formData.instructions.length > 1) { // Keep at least one instruction field
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, imageFiles: Array.from(e.target.files || []) }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    // Basic validation
    if (!formData.title || !formData.description || formData.ingredients.length === 0 || formData.instructions.length === 0) {
      setMessage(tForms('errorMessage'));
      return;
    }

    try {
      let uploadedImageUrls: string[] = [];
      const recipeId = uuidv4(); // Generate a unique ID for the recipe

      // 1. Handle image uploads if files are present
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        setMessage(tForms('uploadingMessage')); // Let the user know uploads are in progress

        for (const file of formData.imageFiles) {
          // Get a pre-signed URL from our API
          const presignedResponse = await fetch('/api/s3/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              recipeId: recipeId, // Pass the unique recipe ID
            }),
          });

          const { url, key } = await presignedResponse.json();

          if (!presignedResponse.ok) {
            throw new Error('Failed to get pre-signed URL.');
          }

          // Upload the file to S3 using the pre-signed URL
          const uploadResponse = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${file.name}`);
          }
          
          // Construct the final URL of the uploaded file
          const fileUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${key}`;
          uploadedImageUrls.push(fileUrl);
        }
      }

      // 2. Submit the recipe data (with image URLs) to the recipe API
      const recipePayload = {
        ...formData,
        imageUrls: uploadedImageUrls,
        imageFiles: undefined, // We don't need to send the files themselves to this endpoint
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipePayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(t('successMessage'));
        setFormData(initialFormData); // Reset form on success
      } else {
        setMessage(result.error || tForms('submissionError'));
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : tForms('submissionError');
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-orangey-accent">
            {/* Use a translation key for the app title */}
            {tNav('appTitle')}
          </Link>
          <nav>
            <ul className="flex gap-4 items-center">
              <li><Link href="/" className="hover:text-orangey-accent transition-colors">{tNav('home')}</Link></li>
              {/* Add other relevant nav links */}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-800 p-6 md:p-8 shadow-xl rounded-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-orangey-accent mb-6 text-center">{t('pageTitle')}</h1>
          
          {message && (
            <div className={`p-4 mb-4 rounded-md ${message.includes('successfully') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('titleLabel')}</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} placeholder={t('titlePlaceholder')} required 
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('descriptionLabel')}</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} placeholder={t('descriptionPlaceholder')} rows={4} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white"></textarea>
            </div>
            
            {/* Dynamic Ingredients Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('ingredientsLabel')}</label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end p-3 border border-gray-200 dark:border-neutral-700 rounded-md">
                  <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor={`ingredient-name-${index}`} className="sr-only">{t('ingredientNamePlaceholder')}</label>
                    <input type="text" id={`ingredient-name-${index}`} value={ingredient.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} placeholder={t('ingredientNamePlaceholder')} required
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
                  </div>
                  <div className="flex-shrink w-full sm:w-auto">
                    <label htmlFor={`ingredient-quantity-${index}`} className="sr-only">{t('ingredientQuantityPlaceholder')}</label>
                    <input type="text" id={`ingredient-quantity-${index}`} value={ingredient.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} placeholder={t('ingredientQuantityPlaceholder')} required
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
                  </div>
                  <div className="flex-shrink w-full sm:w-auto">
                    <label htmlFor={`ingredient-unit-${index}`} className="sr-only">{t('ingredientUnitPlaceholder')}</label>
                    <input type="text" id={`ingredient-unit-${index}`} value={ingredient.unit || ''} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)} placeholder={t('ingredientUnitPlaceholder')}
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
                  </div>
                  {formData.ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredientField(index)} 
                            className="mt-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium w-full sm:w-auto">
                      {t('removeIngredientButton')}
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addIngredientField}
                      className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:text-smoky-black dark:bg-green-500 dark:hover:bg-green-400">
                {t('addIngredientButton')}
              </button>
            </div>

            {/* Dynamic Instructions Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('instructionsLabel')}</label>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border border-gray-200 dark:border-neutral-700 rounded-md">
                  <textarea value={instruction} onChange={(e) => handleInstructionChange(index, e.target.value)} placeholder={t('instructionPlaceholder', { step: index + 1 })} rows={3} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white"></textarea>
                  {formData.instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstructionField(index)}
                            className="mt-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium self-center">
                      {t('removeInstructionButton')}
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addInstructionField}
                      className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:text-smoky-black dark:bg-green-500 dark:hover:bg-green-400">
                {t('addInstructionButton')}
              </button>
            </div>

            <div>
              <label htmlFor="imageFiles" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('imagesLabel')}</label>
              <input type="file" name="imageFiles" id="imageFiles" onChange={handleFileChange} multiple accept="image/*"
                     className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orangey-accent/20 file:text-orangey-accent hover:file:bg-orangey-accent/30 dark:file:bg-orangey-accent/80 dark:file:text-smoky-black" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('prepTimeLabel')}</label>
                <input type="text" name="prepTime" id="prepTime" value={formData.prepTime} onChange={handleChange} placeholder={t('prepTimePlaceholder')}
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
              </div>
              <div>
                <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('cookTimeLabel')}</label>
                <input type="text" name="cookTime" id="cookTime" value={formData.cookTime} onChange={handleChange} placeholder={t('cookTimePlaceholder')}
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
              </div>
            </div>

            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('servingsLabel')}</label>
              <input type="number" name="servings" id="servings" value={formData.servings || ''} onChange={handleChange} placeholder={t('servingsPlaceholder')}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('tagsLabel')}</label>
              <input type="text" name="tags" id="tags" value={formData.tags?.join(', ') || ''} onChange={handleTagChange} placeholder={t('tagsPlaceholder')}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white" />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('languageLabel')}</label>
              <select name="language" id="language" value={formData.language} onChange={handleChange} required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white">
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('notesLabel')}</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} placeholder={t('notesPlaceholder')} rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white"></textarea>
            </div>

            <div>
              <button type="submit" 
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orangey-accent hover:bg-orangey-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orangey-accent dark:text-smoky-black">
                {t('submitButton')}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-neutral-700 mt-10">
        &copy; {new Date().getFullYear()} Recetas del Corazón. {tNav("allRightsReserved")}
      </footer>
    </div>
  );
};

export default AddRecipePage;
