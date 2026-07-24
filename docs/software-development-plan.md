# Software Development Plan: Recetas del Corazón

**Repo:** https://github.com/gercamjr/recetas-del-corazon  
**Vercel:** recetario-nextjs (geracamodev)  
**Live claim:** https://recetario-nextjs.vercel.app (currently default Next.js shell)  
**Date:** 2026-07-24  
**Status:** Pre-production baseline

## Product Vision
Bilingual (English/Spanish) family recipe book and sharing platform. Users can browse, search, and contribute family recipes with photos, ingredients, instructions, timings, servings, tags, and notes. Core experience is simple, accessible, and localized with next-intl. Target: a living digital heirloom for multi-generational family cooking, initially internal/family use, later openable.

## Current State (Verified 2026-07-24)
### Stack (package.json, next.config.ts, tsconfig.json)
- Next.js 15.3.3 (App Router) + React 19 + TypeScript
- next-intl ^4.1.0 (locales: en/es, default en; routing, middleware, navigation wrappers)
- Tailwind CSS 4 + PostCSS
- Mongoose ^8.15.1 + MongoDB
- @aws-sdk/client-s3 + s3-request-presigner for presigned uploads
- uuid for IDs

### Code Inventory (src/)
**Routes & Pages (src/app/[locale]/...):**
- `/` (home): Client component. Fetches real recipes via `/api/recipes`, client-side search/filter by title/desc/tags/ingredients, displays grid with images (picsum fallback), links to detail + add-recipe. Uses i18n translations.
- `/add-recipe`: Full client form with dynamic ingredients/instructions arrays, file upload (multiple images), tags, prep/cook/servings, language select. Handles S3 presigned upload then POST to `/api/recipes`. Resets on success.
- `/recipes/[id]`: Server component using `generateStaticParams` from **mockRecipes** (lib/mock-data.ts). Displays detail with image, meta, lists, tags, notes. **Inconsistent with live DB** — does not fetch from API/Mongo.
- Layout: LocaleLayout with NextIntlClientProvider, dark theme (smoky-black), Geist fonts, metadata "Recetas del Corazón".
- No root app/page.tsx (locale-based).

**APIs (src/app/api/...):**
- `GET/POST /api/recipes`: Connects Mongo via dbConnect, GET returns all sorted by updatedAt; POST validates minimal fields, adds placeholder authorId, creates doc.
- `POST /api/s3/upload`: Generates presigned PUT URL for recipeId-keyed S3 object (expires 10min). Requires AWS envs. Constructs public URL in client using NEXT_PUBLIC_ vars.

**Models & Types:**
- `src/models/Recipe.ts`: Mongoose schema matching Recipe interface (ingredients subdoc, arrays, timestamps, language enum en/es, authorId).
- `src/types/recipe.ts`: Recipe interface + RecipeFormData (omit Mongo fields + imageFiles?: File[]).

**Lib & i18n:**
- `src/lib/mongodb.ts`: Cached connection, requires MONGODB_URI.
- `src/lib/mock-data.ts`: 2 hardcoded English recipes (Carbonara, Tikka Masala) with picsum images — used only in detail page.
- `src/i18n/`: routing (en/es), request config, navigation (Link etc.).
- `messages/en.json` + `es.json`: Translations for HomePage, Navigation, RecipesPage, AddRecipePage, Forms (partial in en).
- `src/middleware.ts`: next-intl middleware, matcher excludes /api etc.

**Other:**
- next.config.ts: withNextIntl plugin, remotePatterns for picsum.photos.
- .github/copilot-instructions.md: Strict edit rules (one file at a time, plans for large changes).
- No tests/, no .github/workflows/, no eslint issues apparent, README default create-next-app.
- Git: main (up-to-date), local feat/rdc-prod-backend, feat/rdc-prod-frontend; remote vercel/react-server-components-cve-vu-ryr7cv (open draft PR #1 for RSC CVE).

### Production Status (Verified via fetch)
- https://recetario-nextjs.vercel.app/ → "Create Next App" default shell (not the built app).
- https://recetario-nextjs.vercel.app/en → 404.
- App is **NOT live** despite Vercel project claim. Likely misconfigured Vercel project (wrong repo/branch/output dir or build settings). Last feature commits from ~2025-07; current date 2026-07.

### Env Vars Required (scattered in code, no .env.example)
- `MONGODB_URI` (server, required for dbConnect)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_REGION`, `AWS_S3_BUCKET_NAME` (server for S3 client)
- `NEXT_PUBLIC_AWS_S3_BUCKET_NAME`, `NEXT_PUBLIC_AWS_S3_REGION` (client for constructing public S3 URLs — note: exposes bucket/region)
- No auth secrets, no other.

### Gaps & Issues
- **Deploy mismatch**: Production serves default shell.
- **Inconsistency**: Recipe detail uses stale mock data; home/add use real Mongo + S3.
- **Security/Auth**: No authentication/authorization. Placeholder authorId. Anyone with form access can POST recipes. S3 creds on server but client URL construction risky.
- **Missing**: Tests (unit/integration/e2e), CI/CD, lint in pipeline, error boundaries, loading states beyond basic, proper 404/i18n handling for all routes, language switcher UI, edit/delete recipes, user profiles.
- **CVE**: Open draft PR for React Server Components vulnerability (Next 15.3.3 context).
- **Other**: Hardcoded styles/colors (orangey-accent), no rate limiting, Mongo no indexes visible, S3 uploads no validation/size limits, detail page generateStaticParams assumes mock.
- **Staleness**: Code from mid-2025, no activity since.

## Target Production State
Fully deployed, bilingual, functional recipe app on Vercel:
- Live at root + /en /es with real Mongo data.
- Working add-recipe with S3 images persisting to DB.
- Detail pages pulling live recipes.
- Secure, monitored, with basic auth/ownership.
- Passing build/lint, with tests and CI.
- Secrets managed in Vercel env, no client-side AWS exposure.
- Responsive, accessible, i18n complete.

## Phased Plan

### P0: Production Fix & CVE (Immediate — unblock deploy)
1. Verify/fix Vercel project settings: connect to gercamjr/recetas-del-corazon main, correct build command (`npm run build`), output `.next`, root dir `/`.
2. Merge/apply open CVE PR (or manual patch for RSC vuln in Next 15).
3. Add all required env vars to Vercel (prod + preview).
4. Deploy and verify: / loads app, /en /es work, recipes fetch from Mongo, form submits (test with real creds).
5. Update README with setup/deploy instructions.
6. **Acceptance**: Live site matches local dev (no default shell, no 404 on locales). Build succeeds on Vercel.

### P1: Backend Hardiness & Security
1. Implement basic auth (e.g., NextAuth.js or Clerk; simple family password or email magic for MVP). Replace placeholder authorId with real user.
2. Add input sanitization/validation (zod/yup), rate limiting on APIs.
3. Mongo: add indexes on title, tags, language; connection pooling review.
4. S3: server-side validation (file type/size), use private buckets + signed URLs for display if needed; avoid NEXT_PUBLIC_ for bucket if possible (proxy uploads).
5. Error handling: consistent API responses, client toasts, logging.
6. Add .env.example, Docker? (optional).
7. **Acceptance**: No open endpoints without auth; recipes tied to users; uploads secure.

### P2: UX Polish & Feature Parity
1. Fix recipe detail: replace mock with live fetch from `/api/recipes/[id]` (add GET by ID endpoint).
2. Add language switcher (next-intl locale switcher component).
3. Enhance images: proper carousel (or simple), lazy load, alt texts, responsive.
4. Add edit/delete for own recipes (with ownership check).
5. Improve search (full-text? server-side), filters (by tag, time, language), pagination/infinite scroll if >20 recipes.
6. Mobile-first refinements, accessibility audit (ARIA, keyboard).
7. Add "About" / family story page, sharing buttons.
8. Complete i18n coverage (es.json full).
9. **Acceptance**: All pages use live data; full bilingual UX; no console errors.

### P3: Post-Launch & Scale
1. User accounts with roles (admin/family), favorites, comments.
2. Analytics (Vercel Analytics or Plausible).
3. Export/print recipes (PDF).
4. Recipe import (from other sources), versioning.
5. Monitoring (Sentry), backups for Mongo/S3.
6. Performance: caching, ISR for lists.
7. Open to public or keep private via auth.
8. **Acceptance**: Production metrics healthy; feature requests triaged.

## Env/Secrets Checklist for Vercel
**Project Settings > Environment Variables (all environments):**
- `MONGODB_URI` = mongodb+srv://... (Atlas recommended, IP allowlist)
- `AWS_ACCESS_KEY_ID` = ...
- `AWS_SECRET_ACCESS_KEY` = ... (least-privilege IAM user for S3 put only)
- `AWS_S3_REGION` = us-east-1 (or match bucket)
- `AWS_S3_BUCKET_NAME` = recetas-del-corazon-images (private recommended)
- `NEXT_PUBLIC_AWS_S3_BUCKET_NAME` = same (or remove if switching to signed)
- `NEXT_PUBLIC_AWS_S3_REGION` = same
- (Optional) `NEXT_PUBLIC_APP_URL` for redirects

**Notes:**
- Never commit .env.local.
- Rotate keys regularly.
- For client images, consider CloudFront or Next.js Image optimization proxy to avoid public bucket exposure.
- Mongo: use connection string with retryWrites etc.

## Acceptance Criteria for "Production Ready"
- [ ] Vercel deployment serves the full localized app at https://recetario-nextjs.vercel.app (and subpaths).
- [ ] Recipes list, search, add (with images to S3), and detail all functional with live Mongo data.
- [ ] No default shell or 404s on /en /es.
- [ ] CVE patch merged and deployed (Next/React secure).
- [ ] All required env vars set; build passes `npm run build && npm run lint`.
- [ ] Basic error handling and loading states present.
- [ ] README updated with local dev, env setup, deploy steps.
- [ ] No hardcoded secrets or placeholder auth in prod paths.
- [ ] Bilingual navigation and content complete.
- [ ] Open risks documented and mitigated or accepted with plan.

## Open Risks & Mitigations
- **Deploy mismatch / Vercel config drift**: High. Mitigation: Explicit Vercel project audit + docs in P0. Verify with `vercel --prod`.
- **Open CVE (RSC vuln)**: High security. Mitigation: Merge PR immediately in P0; monitor Next.js releases.
- **No authentication/authorization**: High (data integrity, spam). Mitigation: P1 auth layer before public exposure.
- **No automated tests / CI**: Medium (regressions). Mitigation: Add Jest/Playwright + GitHub Actions in P1/P2.
- **S3 credential exposure / client URL construction**: Medium. Mitigation: Server-only signed URLs or private bucket + proxy in P1.
- **Inconsistent data layer (mock vs real)**: Medium. Mitigation: P2 refactor detail page.
- **Stale code / branch proliferation** (multiple feat branches): Low. Mitigation: Rebase or delete unused; enforce main-only for prod.
- **Mongo/S3 availability & costs**: Low. Mitigation: Free tiers for MVP; monitoring in P3.
- **i18n edge cases / missing translations**: Low. Mitigation: Full audit in P2.
- **Scalability (no pagination, search client-side)**: Low for family use. Mitigation: Server queries in P2.

## Next Steps for Eng
1. Claim P0 tasks (Vercel fix + CVE).
2. Use `npm run build` locally to verify before deploy.
3. Reference sibling family-recipes-app only for patterns, not merge.
4. Update this plan as phases complete (add dates, links to PRs).
5. Profile now uses github-copilot gpt-5.6-sol per operator note.

**Plan Owner:** pm (this baseline)  
**Review Gate:** Human review of deployed P0 before P1.

---
*This document grounds the product in live repo + production status. Do not confuse with gercamjr/family-recipes-app.*