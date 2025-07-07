'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Recipe } from "@/types/recipe";

// Mock Recipe Data (Temporary) - This would typically come from an API
const mockRecipes: Recipe[] = [
  {
    _id: '1',
    title: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish.',
    ingredients: [
      { name: 'Spaghetti', quantity: '200', unit: 'g' },
      { name: 'Guanciale', quantity: '100', unit: 'g' },
      { name: 'Eggs', quantity: '2' },
      { name: 'Pecorino Romano', quantity: '50', unit: 'g' },
      { name: 'Black Pepper', quantity: 'to taste' },
    ],
    instructions: [
      'Cook spaghetti according to package directions.',
      'While pasta cooks, fry guanciale until crispy.',
      'Whisk eggs and Pecorino Romano in a bowl.',
      'Drain pasta, reserving some pasta water.',
      'Combine pasta with guanciale. Then, quickly mix in egg mixture. Add pasta water if needed to create a creamy sauce.',
      'Serve immediately with a generous sprinkle of black pepper and more Pecorino.'
    ],
    imageUrls: ['https://picsum.photos/200/400', 'https://picsum.photos/200/400'],
    tags: ['pasta', 'italian', 'classic'],
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 2,
    authorId: 'family-member-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'en',
  },
  {
    _id: '2',
    title: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry.',
    ingredients: [
      { name: 'Chicken Breast', quantity: '500', unit: 'g' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Tikka Masala Paste', quantity: '2', unit: 'tbsp' },
      { name: 'Onion', quantity: '1' },
      { name: 'Tomato Puree', quantity: '400', unit: 'g' },
      { name: 'Heavy Cream', quantity: '1/2', unit: 'cup' },
      { name: 'Cilantro', quantity: 'for garnish' },
    ],
    instructions: [
      'Marinate chicken in yogurt and tikka masala paste for at least 1 hour.',
      'Sauté onion in a large pan until softened.',
      'Add chicken and cook until browned.',
      'Stir in tomato puree and simmer for 15 minutes.',
      'Add heavy cream and cook for another 5 minutes.',
      'Garnish with cilantro and serve with rice or naan.'
    ],
    imageUrls: ['https://picsum.photos/seed/picsum/200/400'],
    tags: ['indian', 'curry', 'chicken'],
    prepTime: '20 mins (plus marination)',
    cookTime: '30 mins',
    servings: 4,
    authorId: 'family-member-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'en',
  },
  // Add more mock recipes if desired
];

const DEBOUNCE_DELAY = 300; // milliseconds

export default function Home() {
  const locale = useLocale(); // Get locale using the hook

  const t = useTranslations('HomePage');
  const tNav = useTranslations('Navigation');
  const tRecipes = useTranslations('RecipesPage');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(mockRecipes);

  // Effect to update debouncedSearchTerm after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    // Cleanup function to clear the timeout if searchTerm changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]); // Only re-call effect if searchTerm changes

  // Effect to filter recipes based on debouncedSearchTerm
  useEffect(() => {
    const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
    if (lowercasedSearchTerm === '') {
      setFilteredRecipes(mockRecipes);
    } else {
      const results = mockRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(lowercasedSearchTerm) ||
        recipe.description.toLowerCase().includes(lowercasedSearchTerm) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm))) ||
        (recipe.ingredients && recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowercasedSearchTerm)))
      );
      setFilteredRecipes(results);
    }
  }, [debouncedSearchTerm]); // Only re-call effect if debouncedSearchTerm changes

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
        {filteredRecipes.length > 0 ? (
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
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {debouncedSearchTerm ? tRecipes('noResultsFound') : tRecipes('noRecipes')} 
            {/* Display different message if debouncedSearchTerm exists */}
          </p>
        )}
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
