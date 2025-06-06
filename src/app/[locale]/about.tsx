import { useParams } from "next/navigation";

const translations = {
  en: {
    title: "About",
    content: "This is a family recipes app built with Next.js and the App Router i18n system.",
  },
  es: {
    title: "Acerca de",
    content: "Esta es una aplicación de recetas familiares construida con Next.js y el sistema i18n de App Router.",
  },
};

export default function AboutPage() {
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
