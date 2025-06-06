export default function Footer() {
  return (
    <footer className="w-full p-4 border-t border-cadmium-orange bg-white dark:bg-smoky-black text-center text-xs text-smoky-black dark:text-white" role="contentinfo">
      <span>&copy; {new Date().getFullYear()} Recetas del Corazón. All rights reserved.</span>
    </footer>
  );
}
