"use client";

"use client";
import { usePathname, useRouter } from "next/navigation";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    // Replace the first segment with the new locale
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang-select" className="sr-only">
        Language
      </label>
      <select
        id="lang-select"
        value={currentLocale}
        onChange={handleChange}
        className="border rounded px-2 py-1 bg-white text-smoky-black dark:bg-smoky-black dark:text-white"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
