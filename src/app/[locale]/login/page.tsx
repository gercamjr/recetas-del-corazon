'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const tNav = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn('credentials', {
      username: username.trim(),
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError(t('invalidCredentials'));
      return;
    }

    router.push('/add-recipe');
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-smoky-black px-5 text-neutral-200">
      <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900/80 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orangey-accent">
            {tNav('home')}
          </Link>
          <LocaleSwitcher />
        </div>
        <h1 className="text-2xl font-semibold text-white">{t('loginTitle')}</h1>
        <p className="mt-2 text-sm text-neutral-400">{t('loginSubtitle')}</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-300">
              {t('username')}
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-neutral-100 focus:border-orangey-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-neutral-100 focus:border-orangey-accent focus:outline-none"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-orangey-accent px-4 py-2.5 font-semibold text-smoky-black transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          {t('familyOnlyNote', { locale })}
        </p>
      </div>
    </div>
  );
}
