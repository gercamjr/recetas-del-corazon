import Image from "next/image";
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import type { Recipe } from "@/types/recipe"; // Added import for Recipe type

// Enable static rendering for this page
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

// Mock Recipe Data (Temporary)
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
    imageUrls: ['/mock-images/carbonara1.jpg', '/mock-images/carbonara2.jpg'], // Placeholder image URLs
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
    imageUrls: ['/mock-images/tikka-masala.jpg'], // Placeholder image URL
    tags: ['indian', 'curry', 'chicken'],
    prepTime: '20 mins (plus marination)',
    cookTime: '30 mins',
    servings: 4,
    authorId: 'family-member-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'en',
  },
];

export default function Home({params: {locale}}: {params: {locale: string}}) {
  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations('HomePage');
  const tNav = useTranslations('Navigation');
  const tRecipes = useTranslations('RecipesPage'); // Added for recipe-specific translations

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
        <h2 className="text-3xl font-bold text-center sm:text-left">{tRecipes('allRecipes')}</h2>
        
        {/* Recipe List Section */}
        {mockRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRecipes.map((recipe) => (
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
          <p className="text-center text-gray-500 dark:text-gray-400">{tRecipes('noRecipes')}</p>
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
