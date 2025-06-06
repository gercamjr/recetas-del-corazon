import { useParams } from "next/navigation";

const translations = {
  en: {
    title: "Recipes",
    content: "Browse and search your family recipes here.",
  },
  es: {
    title: "Recetas",
    content: "Busca y explora tus recetas familiares aquí.",
  },
};

export default function RecipesPage() {
  const params = useParams();
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale || "en";
  const t = translations[locale as "en" | "es"] || translations.en;

  return (
    <section className="py-8">
      <h1 className="font-heading text-2xl text-cadmium-orange mb-4">{t.title}</h1>
      <p>{t.content}</p>
    </section>
  );
}
