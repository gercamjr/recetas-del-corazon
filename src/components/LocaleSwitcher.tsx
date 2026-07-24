'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useTransition} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === 'en' ? 'es' : 'en';

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.replace(pathname, {locale: nextLocale});
        });
      }}
      disabled={isPending || !routing.locales.includes(nextLocale)}
      aria-label={t('switchTo', {language: t(nextLocale)})}
      className="rounded-full border border-neutral-600 px-3 py-1.5 text-sm font-medium text-neutral-200 transition-colors hover:border-orangey-accent hover:text-orangey-accent disabled:cursor-wait disabled:opacity-60"
    >
      {t(nextLocale)}
    </button>
  );
}
