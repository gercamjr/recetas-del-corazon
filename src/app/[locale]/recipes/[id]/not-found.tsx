'use client';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function RecipeNotFound() {
  const t = useTranslations('RecipesPage');
  const tNav = useTranslations('Navigation');

  return (
    <div className="grid min-h-screen place-items-center bg-smoky-black px-5 text-neutral-200">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
        <h1 className="text-3xl font-bold text-white">{t('recipeNotFoundTitle')}</h1>
        <p className="mt-3 text-neutral-400">{t('recipeNotFoundDescription')}</p>
        <div className="mt-6 flex items-center justify-center gap-5">
          <Link href="/" className="font-semibold text-orangey-accent hover:text-orange-300">
            {tNav('home')}
          </Link>
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
