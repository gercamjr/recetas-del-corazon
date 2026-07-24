# Vercel deployment

The intended Vercel project is `recetario-nextjs` under the `geracamodev` scope, with production URL `https://recetario-nextjs.vercel.app`. The local Vercel CLI was available during the production-readiness audit but had no credentials, so the repository could not be linked or redeployed from this machine.

## 1. Connect the correct repository

In Vercel, open **Project Settings → Git** and verify:

- Repository: `gercamjr/recetas-del-corazon`
- Production branch: `main`
- Root directory: repository root (`.`)
- Framework preset: Next.js
- Install command: `npm install` (or the Vercel default)
- Build command: `npm run build`
- Output directory: leave blank so the Next.js preset manages `.next`

If using an authenticated CLI instead:

```sh
vercel link --project recetario-nextjs --scope geracamodev
```

Do not commit the generated `.vercel` directory.

## 2. Configure environment variables

Use `docs/env.example` as the contract. Add all eight values to both **Production** and **Preview** environments in **Project Settings → Environment Variables**:

- `MONGODB_URI`
- `FAMILY_ACCESS_TOKEN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_REGION`
- `AWS_S3_BUCKET_NAME`
- `NEXT_PUBLIC_AWS_S3_REGION`
- `NEXT_PUBLIC_AWS_S3_BUCKET_NAME`

Generate `FAMILY_ACCESS_TOKEN` with a cryptographically secure password generator, store it as a Vercel secret, and share it only with trusted family members. The add-recipe page keeps the entered value in tab-scoped `sessionStorage` and sends it in the `x-family-token` header. The API also accepts a `family_access_token` cookie for a future password-form flow. `RDC_WRITE_TOKEN` remains a supported fallback, but new deployments should use `FAMILY_ACCESS_TOKEN`.

Use a MongoDB user restricted to the application database and an AWS IAM identity restricted to `s3:PutObject` for `<bucket>/recipes/*`. Never put these credentials or the family token in a `NEXT_PUBLIC_` variable.

The S3 bucket must allow browser PUT requests from the production and preview origins. A minimal CORS policy should allow `PUT`, the `Content-Type` request header, and only the app's trusted origins. Uploaded images currently require public read access because the client stores and renders public S3 URLs.

## 3. Redeploy the patched branch

After this PR is reviewed and merged to `main`, trigger a deployment from the Vercel Deployments page, or run from an authenticated, linked checkout:

```sh
vercel --prod
```

Do not promote the existing stale deployment. Build a fresh deployment from the merge commit so Next.js `15.5.21` and the updated lockfile are used.

## 4. Verify before promotion

1. Confirm the Vercel build log runs `npm run build` successfully.
2. Open `/`, `/en`, and `/es`; the localized recipe app must render instead of the Create Next App shell.
3. Call `GET /api/recipes`; with Mongo configured it should return JSON with `success: true`.
4. Confirm recipe submission and upload signing return `401` without the family token or with an incorrect token.
5. Enter the configured family token and submit a valid recipe without an image, then with a small JPEG/PNG/WebP image.
6. Confirm the object lands under `recipes/<recipeId>/` and the stored image URL renders.
7. Confirm invalid recipe input returns `400`, absent service configuration returns `503`, and API errors do not expose credentials or internal exception details.

## Write protection scope

`POST /api/recipes` and `POST /api/s3/upload` require the shared family token in production. If neither supported token environment variable is configured, production writes fail closed with `503`; non-production writes remain open with a server warning for local development. `GET /api/recipes` remains public.

This shared token is an MVP abuse guard, not user identity or ownership. Add per-user authentication, authorization, token rotation, and rate limiting before expanding access beyond the trusted family group.

Because the previously deployed app used a React Server Components-vulnerable Next.js release, rotate MongoDB and AWS credentials after the patched deployment is live if those credentials were present in that deployment.
