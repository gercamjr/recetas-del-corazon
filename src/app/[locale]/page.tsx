'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Recipe } from "@/types/recipe";
import LocaleSwitcher from '@/components/LocaleSwitcher';

const DEBOUNCE_DELAY = 300; // milliseconds

export default function Home() {
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

  const fetchRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/recipes');
      const data: {success?: boolean; data?: Recipe[]; error?: string} = await response.json();

      if (!response.ok || !data.success || !Array.isArray(data.data)) {
        throw new Error(data.error || 'Failed to fetch recipes');
      }

      setAllRecipes(data.data);
      setFilteredRecipes(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      console.warn("Recipe fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

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
      return (
        <div aria-label={tRecipes('loading')} aria-live="polite" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="h-48 bg-neutral-800" />
              <div className="space-y-3 p-5">
                <div className="h-6 w-2/3 rounded bg-neutral-800" />
                <div className="h-4 rounded bg-neutral-800" />
                <div className="h-4 w-3/4 rounded bg-neutral-800" />
              </div>
            </div>
          ))}
          <span className="sr-only">{tRecipes('loading')}</span>
        </div>
      );
    }

    if (error) {
      return (
        <div role="alert" className="rounded-2xl border border-red-900/70 bg-red-950/40 p-8 text-center">
          <h3 className="text-xl font-semibold text-red-200">{tRecipes('loadErrorTitle')}</h3>
          <p className="mt-2 text-sm text-red-300">{tRecipes('loadErrorDescription')}</p>
          <button type="button" onClick={() => void fetchRecipes()} className="mt-5 rounded-full bg-orangey-accent px-5 py-2 font-semibold text-smoky-black transition hover:bg-orange-400">
            {tRecipes('retry')}
          </button>
        </div>
      );
    }

    if (filteredRecipes.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe, index) => (
            <article key={recipe._id} className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-orange-700">
              {recipe.imageUrls && recipe.imageUrls.length > 0 && (
                <Image
                  src={recipe.imageUrls[0]} // Display the first image as a preview
                  alt={recipe.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                  priority={index < 3}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              )}
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2 text-orangey-accent">{recipe.title}</h3>
                <p className="mb-5 line-clamp-2 text-sm leading-6 text-neutral-300">{recipe.description}</p>
                <div className="flex items-end justify-between gap-4">
                  <span className="text-xs text-neutral-400">
                    {recipe.prepTime && recipe.cookTime ? `${tRecipes('prep')}: ${recipe.prepTime} | ${tRecipes('cook')}: ${recipe.cookTime}` : tRecipes('timeNotSpecified')}
                  </span>
                  <Link href={`/recipes/${recipe._id}`} className="shrink-0 text-sm font-semibold text-orangey-accent hover:text-orange-300">
                    {tRecipes('viewRecipe')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/60 px-6 py-14 text-center">
        <h3 className="text-xl font-semibold text-neutral-100">
          {debouncedSearchTerm ? tRecipes('noResultsFound') : tRecipes('noRecipes')}
        </h3>
        {debouncedSearchTerm ? (
          <button type="button" onClick={() => setSearchTerm('')} className="mt-4 text-sm font-semibold text-orangey-accent hover:text-orange-300">
            {tRecipes('clearSearch')}
          </button>
        ) : (
          <Link href="/add-recipe" className="mt-5 inline-flex rounded-full bg-orangey-accent px-5 py-2 font-semibold text-smoky-black transition hover:bg-orange-400">
            {tNav('addRecipe')}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-smoky-black font-[family-name:var(--font-geist-sans)] text-neutral-200">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-smoky-black/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="text-xl font-bold text-orangey-accent sm:text-2xl">{tNav('appTitle')}</Link>
          <nav aria-label={tNav('primaryNavigation')}>
          <ul className="flex items-center gap-3 sm:gap-5">
            <li><Link href="/" className="hover:text-orangey-accent transition-colors">{tNav('home')}</Link></li>
            <li><Link href="/add-recipe" className="hover:text-orangey-accent transition-colors">{tNav('addRecipe')}</Link></li>
            <li><LocaleSwitcher /></li>
          </ul>
        </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 sm:py-16">
        <section className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-orangey-accent">{t('eyebrow')}</p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{t('title')}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-400">{t('description')}</p>
        </section>
        <section aria-labelledby="recipes-heading">
        <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 id="recipes-heading" className="text-3xl font-bold">{tRecipes('allRecipes')}</h2>
          <input
            type="search"
            placeholder={tRecipes('searchPlaceholder')}
            aria-label={tRecipes('searchLabel')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-5 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-orangey-accent focus:ring-2 focus:ring-orange-500/20 sm:w-80"
          />
        </div>
        {renderRecipeList()}
        </section>
      </main>
      <footer className="border-t border-neutral-800 px-5 py-8 text-center">
        <p className="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} {t('title')}. {tRecipes('allRightsReserved')}
        </p>
      </footer>
    </div>
  );
}
