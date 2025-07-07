'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Recipe } from "@/types/recipe";

const DEBOUNCE_DELAY = 300; // milliseconds

export default function Home() {
  const locale = useLocale(); // Get locale using the hook

  const t = useTranslations('HomePage');
  const tNav = useTranslations('Navigation');
  const tRecipes = useTranslations('RecipesPage');

  // State for API data
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  // Effect to fetch recipes from the API when the component mounts
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/recipes');
        if (!response.ok) {
          // Try to get a more detailed error from the response body
          const errorData = await response.json().catch(() => null); // Avoid further errors if body is not JSON
          throw new Error(errorData?.error || 'Failed to fetch recipes');
        }
        const data = await response.json();
        if (data.success) {
          setAllRecipes(data.data);
          setFilteredRecipes(data.data); // Initially, filtered list is the full list
        } else {
          throw new Error(data.error || 'An unknown API error occurred');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to update debouncedSearchTerm after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    // Cleanup function to clear the timeout if searchTerm changes
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Effect to filter recipes based on the debounced search term
  useEffect(() => {
    const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
    if (lowercasedSearchTerm === '') {
      setFilteredRecipes(allRecipes); // If search is empty, show all recipes
    } else {
      const results = allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(lowercasedSearchTerm) ||
        recipe.description.toLowerCase().includes(lowercasedSearchTerm) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm))) ||
        (recipe.ingredients && recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowercasedSearchTerm)))
      );
      setFilteredRecipes(results);
    }
  }, [debouncedSearchTerm, allRecipes]); // Rerun when search term or the main recipe list changes

  const renderRecipeList = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500 dark:text-gray-400">Loading recipes...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500 dark:text-red-400">Error: {error}</p>;
    }

    if (filteredRecipes.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe._id} className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-hidden transition-transform hover:scale-105">
              {recipe.imageUrls && recipe.imageUrls.length > 0 && (
                <Image 
                  src={recipe.imageUrls[0]} // Display the first image as a preview
                  alt={recipe.title} 
                  width={400} 
                  height={250} 
                  className="w-full h-48 object-cover"
                  priority={true} // Prioritize images in the viewport
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-orangey-accent">{recipe.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">{recipe.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {recipe.prepTime && recipe.cookTime ? `${tRecipes('prep')}: ${recipe.prepTime} | ${tRecipes('cook')}: ${recipe.cookTime}` : tRecipes('timeNotSpecified')}
                  </span>
                  <Link href={`/recipes/${recipe._id}`} className="text-sm text-blue-500 hover:underline">
                    {tRecipes('viewRecipe')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        {debouncedSearchTerm ? tRecipes('noResultsFound') : tRecipes('noRecipes')}
      </p>
    );
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-start justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-between w-full items-center">
        <h1 className="text-2xl font-bold text-orangey-accent">{t('title')}</h1>
        <nav>
          <ul className="flex gap-4">
            <li><Link href="/" className="hover:text-orangey-accent transition-colors">{tNav('home')}</Link></li>
            {/* We might want a dedicated recipes link later, but for now, home page lists them */}
            {/* <li><Link href="/recipes" className="hover:text-orangey-accent transition-colors">{tNav('recipes')}</Link></li> */}
            <li><Link href="/add-recipe" className="hover:text-orangey-accent transition-colors">{tNav('addRecipe')}</Link></li>
            {/* Add other nav links like 'About' if needed */}
          </ul>
        </nav>
      </header>
      <main className="flex flex-col gap-8 w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-center sm:text-left">{tRecipes('allRecipes')}</h2>
          <input 
            type="search"
            placeholder={tRecipes('searchPlaceholder')}
            value={searchTerm} // Input still controlled by searchTerm directly for responsiveness
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-orangey-accent focus:border-orangey-accent sm:text-sm dark:bg-neutral-700 dark:text-white w-full sm:w-auto"
          />
        </div>
        
        {/* Recipe List Section */}
        {renderRecipeList()}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center mt-10">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {t('title')}. {tRecipes('allRightsReserved')}
        </p>
        {/* Add other footer links if needed */}
      </footer>
    </div>
  );
}
