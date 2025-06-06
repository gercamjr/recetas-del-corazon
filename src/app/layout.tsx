


import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";
// TODO: Import Jakusty font here when available (local or CDN)

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Recetas del Corazón",
  description: "Family recipes app",
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-body bg-white text-smoky-black dark:bg-smoky-black dark:text-white antialiased flex flex-col min-h-screen">
        {/* Heading elements should use font-heading via Tailwind */}
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto p-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
