import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between p-4 border-b border-cadmium-orange bg-white dark:bg-smoky-black" role="banner">
      <div className="flex items-center gap-2">
        <span className="font-heading text-2xl text-cadmium-orange">Recetas del Corazón</span>
      </div>
      <nav aria-label="Main navigation" className="mt-2 sm:mt-0">
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
