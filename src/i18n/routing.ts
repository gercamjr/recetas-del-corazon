import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches. Keep the prefix explicit so `/` always
  // resolves through middleware to a locale-specific application route.
  defaultLocale: 'en',
  localePrefix: 'always'
});
