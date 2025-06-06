# Recetas del Corazón

This is a family recipes app built with Next.js, designed for a modern, private, and beautiful experience.

## Project Plan & Features

- **Frontend:** Next.js (React), Tailwind CSS (customized with our palette)
- **Localization:** next-i18next for multi-language support
- **Fonts:** Jakusty (headings, logo), Open Sans (body text)
- **Colors:** Cadmium Orange (#EB8B2B), Smoky Black (#180E04), White (#FFFFFF)
- **Image Handling:** Next.js Image component, AWS S3 (placeholder for integration)
- **Database:** MongoDB Atlas (hosted)
- **Auth:** NextAuth.js (family-only access)
- **Deployment:** Vercel
- **Features:**
  - Responsive, modern Mexican-inspired UI
  - Instant search
  - Printable recipes
  - Multi-image support
  - Hybrid categories
  - Language switcher

## Folder Structure

- `/pages` (Next.js routing)
- `/components` (UI components)
- `/styles` (global styles, Tailwind config)
- `/lib` (utility functions, API)
- `/public` (static assets, e.g., logo)

## Setup Steps

1. Scaffold Next.js app with TypeScript, Tailwind CSS, App Router
2. Integrate next-i18next for localization
3. Add Jakusty & Open Sans fonts, customize Tailwind with palette
4. Scaffold main folders
5. Add responsive layout (header, footer, language switcher placeholder)
6. Placeholder for AWS S3 image upload (`@aws-sdk/client-s3` recommended)
7. Prepare for Vercel deployment

---

## Getting Started

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Start editing by modifying files in `/src/app` or `/src/pages`.

---

## Deployment

Deploy easily to Vercel. See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
