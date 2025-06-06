import { useParams } from "next/navigation";

const translations = {
  en: {
    welcome: "Welcome to Recetas del Corazón!",
  },
  es: {
    welcome: "¡Bienvenido a Recetas del Corazón!",
  },
};

export default function Home() {
  // Get the current locale from the URL
  const params = useParams();
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale || "en";
  const t = translations[locale as "en" | "es"] || translations.en;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="font-heading text-3xl text-cadmium-orange mb-4">{t.welcome}</h1>
      {/* Add more localized content here */}
    </main>
  );
}
