import { use } from "react";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Image from "next/image";
import { mockRecipes } from "@/lib/mock-data"; // Import mock data
import { Recipe } from "@/types/recipe";
import { notFound } from "next/navigation";

// Enable static rendering and generate routes for each recipe
export function generateStaticParams() {
  const recipeParams = mockRecipes.flatMap(recipe => 
    routing.locales.map(locale => ({ locale, id: recipe._id }))
  );
  return recipeParams;
}

interface RecipeDetailPageProps {
  params: {
    locale: string;
    id: string;
  };
}

const RecipeDetailPage: NextPage<RecipeDetailPageProps> = props => {
  const params = props.params;
  setRequestLocale(params.locale);
  const t = useTranslations("RecipesPage");
  const tNav = useTranslations("Navigation");

  const recipe = mockRecipes.find((r) => r._id === params.id);

  if (!recipe) {
    notFound(); // If recipe not found, show 404 page
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-orangey-accent">
            {tNav("home")}
          </Link>
          <nav>
            <ul className="flex gap-4 items-center">
              <li><Link href="/" className="hover:text-orangey-accent transition-colors">{tNav('home')}</Link></li>
              <li><Link href="/add-recipe" className="hover:text-orangey-accent transition-colors">{tNav('addRecipe')}</Link></li>
              {/* Language switcher can be added here later */}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
          {/* Image Carousel/Gallery */}
          {recipe.imageUrls && recipe.imageUrls.length > 0 && (
            <div className="relative w-full h-64 sm:h-80 md:h-96">
              {/* Basic image display, can be enhanced with a carousel later */}
              <Image 
                src={recipe.imageUrls[0]} 
                alt={`Image 1 for ${recipe.title}`}
                layout="fill"
                objectFit="cover"
                priority 
              />
              {/* TODO: Add a simple carousel or grid for multiple images */}
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-orangey-accent mb-4">{recipe.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{recipe.description}</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {recipe.prepTime && (
                <div className="bg-gray-100 dark:bg-neutral-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("prepTime")}</h3>
                  <p className="text-lg">{recipe.prepTime}</p>
                </div>
              )}
              {recipe.cookTime && (
                <div className="bg-gray-100 dark:bg-neutral-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cookTime")}</h3>
                  <p className="text-lg">{recipe.cookTime}</p>
                </div>
              )}
              {recipe.servings && (
                <div className="bg-gray-100 dark:bg-neutral-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("servings")}</h3>
                  <p className="text-lg">{recipe.servings}</p>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{t("ingredients")}</h2>
              <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700 dark:text-gray-300">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.quantity} {ingredient.unit || ''} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{t("instructions")}</h2>
              <ol className="list-decimal list-inside space-y-3 pl-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{t("tags")}</h2>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="bg-orangey-accent/20 text-orangey-accent px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recipe.notes && (
                 <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded">
                    <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">{t("notes")}</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{recipe.notes}</p>
                </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <p>{t("author")}: {recipe.authorId} {/* Replace with actual author name later */}</p>
              <p>{t("lastUpdated")}: {new Date(recipe.updatedAt).toLocaleDateString(params.locale, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

          </div>
        </article>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-neutral-700 mt-10">
        &copy; {new Date().getFullYear()} {tNav("home")}. {t("allRightsReserved")}
      </footer>
    </div>
  );
};

export default RecipeDetailPage;
