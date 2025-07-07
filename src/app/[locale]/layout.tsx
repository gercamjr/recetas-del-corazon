import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Corrected path
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {setRequestLocale} from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recetas del Corazón",
  description: "A family recipe sharing app",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  if (!hasLocale(routing.locales, locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Error loading messages for locale '${locale}':`, error);
    notFound();
  }

  if (!messages || typeof messages !== 'object' || messages === null) {
    console.error(`Messages for locale '${locale}' are invalid, empty, or not an object.`);
    notFound();
  }

  return (
    <html lang={locale} className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-smoky-black text-neutral-200`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
