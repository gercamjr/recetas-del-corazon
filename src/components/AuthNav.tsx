'use client';

import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function AuthNav() {
  const { data: session, status } = useSession();
  const t = useTranslations('Auth');

  if (status === 'loading') {
    return <span className="text-sm text-neutral-400">{t('loading')}</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline text-neutral-300">
          {t('signedInAs', { name: session.user.name || session.user.username })}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-full border border-neutral-600 px-3 py-1.5 font-medium text-neutral-200 transition-colors hover:border-orangey-accent hover:text-orangey-accent"
        >
          {t('signOut')}
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-full border border-orangey-accent/60 px-3 py-1.5 text-sm font-medium text-orangey-accent transition-colors hover:bg-orangey-accent/10"
    >
      {t('signIn')}
    </Link>
  );
}
