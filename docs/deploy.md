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

Use `docs/env.example` as the contract. Add all seven values to both **Production** and **Preview** environments in **Project Settings → Environment Variables**:

- `MONGODB_URI`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_REGION`
- `AWS_S3_BUCKET_NAME`
- `NEXT_PUBLIC_AWS_S3_REGION`
- `NEXT_PUBLIC_AWS_S3_BUCKET_NAME`

Use a MongoDB user restricted to the application database and an AWS IAM identity restricted to `s3:PutObject` for `<bucket>/recipes/*`. Never put either credential in a `NEXT_PUBLIC_` variable.

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
4. Submit a valid recipe without an image, then with a small JPEG/PNG/WebP image.
5. Confirm the object lands under `recipes/<recipeId>/` and the stored image URL renders.
6. Confirm invalid recipe input returns `400`, absent service configuration returns `503`, and API errors do not expose credentials or internal exception details.

## Known release blocker: write authorization

`POST /api/recipes` and `POST /api/s3/upload` are not authenticated. Input and upload-key validation reduce abuse, but they do not establish identity or ownership. Keep the deployment access-restricted until authentication, authorization, and rate limiting are added, or explicitly accept this risk before making the site public.

Because the previously deployed app used a React Server Components-vulnerable Next.js release, rotate MongoDB and AWS credentials after the patched deployment is live if those credentials were present in that deployment.
